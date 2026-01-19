import { useEffect, useState, useRef, useCallback } from 'react';
import { createClient } from '@/utils/supabase/client';
import { useAuth } from '@/context/AuthContext';
import Peer from 'peerjs';

export type InteractionStatus = 'waiting' | 'live' | 'ended' | 'idle';

export interface LiveInteraction {
    id: string;
    user_id: string;
    user_name: string;
    user_avatar?: string;
    status: InteractionStatus;
    peer_id: string;
    created_at: string;
}

export const useLiveInteraction = () => {
    const { user, profile } = useAuth();
    const supabase = createClient();
    
    // State
    const [status, setStatus] = useState<InteractionStatus>('idle');
    const [queue, setQueue] = useState<LiveInteraction[]>([]);
    const [currentSpeaker, setCurrentSpeaker] = useState<LiveInteraction | null>(null);
    const [peerId, setPeerId] = useState<string | null>(null);
    const [connectionError, setConnectionError] = useState<string | null>(null);
    const [isMuted, setIsMuted] = useState(false); // Local mic mute

    // Refs
    const peerRef = useRef<Peer | null>(null);
    const localStreamRef = useRef<MediaStream | null>(null);
    const remoteAudioRef = useRef<HTMLAudioElement | null>(null);
    const activeCallRef = useRef<any>(null); // Keep track of current call

    // Initialize Audio Element for remote stream (Teacher hears Student, Student hears Teacher)
    useEffect(() => {
        remoteAudioRef.current = new Audio();
    }, []);

    // 1. Initialize PeerJS
    useEffect(() => {
        if (!user) return;

        // Ensure Peer is only running on client
        if (typeof window === 'undefined') return;

        // Use User ID as Peer ID for easy mapping
        const peer = new Peer(user.id, {
            debug: 2,
            config: {
                iceServers: [
                    { urls: 'stun:stun.l.google.com:19302' },
                    { urls: 'stun:global.stun.twilio.com:3478' }
                ]
            }
        });

        peer.on('open', (id) => {
            console.log('My Peer ID is: ' + id);
            setPeerId(id);
            setConnectionError(null);
        });

        peer.on('error', (err) => {
            console.error('PeerJS Error:', err);
            setConnectionError('Voice server connection failed.');
        });

        // HANDLE INCOMING CALLS (Student receiving call from Teacher)
        peer.on('call', async (call) => {
            console.log('Incoming call from:', call.peer);
            
            // If we are the student, we answer with our microphone
            try {
                const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
                localStreamRef.current = stream;
                call.answer(stream); // Answer the call with an A/V stream.
                
                activeCallRef.current = call;
                setStatus('live');

                // Receive Teacher's audio (if any)
                call.on('stream', (remoteStream) => {
                     // Play teacher's voice if they speak back
                     if (remoteAudioRef.current) {
                        remoteAudioRef.current.srcObject = remoteStream;
                        remoteAudioRef.current.play().catch(e => console.error("Error playing remote audio", e));
                     }
                });

                call.on('close', () => {
                    handleEndCallCleanup();
                });

            } catch (err) {
                console.error('Failed to get local stream', err);
                setConnectionError('Could not access microphone.');
            }
        });

        peerRef.current = peer;

        return () => {
            peer.destroy();
            if (localStreamRef.current) {
                localStreamRef.current.getTracks().forEach(track => track.stop());
            }
        };
    }, [user]);

    // 2. Load Initial Queue & Subscribe to Realtime Changes
    useEffect(() => {
        const fetchQueue = async () => {
            const { data, error } = await supabase
                .from('live_interactions')
                .select('*')
                .in('status', ['waiting', 'live'])
                .order('created_at', { ascending: true });
            
            if (error) console.error(error);
            else {
                setQueue(data as LiveInteraction[]);
                // Check if anyone is currently live
                const liveUser = data.find(i => i.status === 'live');
                if (liveUser) setCurrentSpeaker(liveUser);
                
                // If I am that user, update my local status
                if (liveUser && liveUser.user_id === user?.id) {
                    setStatus('live');
                } else {
                    // Check if I am in queue
                    const myRequest = data.find(i => i.user_id === user?.id && i.status === 'waiting');
                    if (myRequest) setStatus('waiting');
                }
            }
        };

        fetchQueue();

        const channel = supabase
            .channel('live_interactions_changes')
            .on('postgres_changes', { 
                event: '*', 
                schema: 'public', 
                table: 'live_interactions' 
            }, (payload) => {
                console.log('Realtime Change:', payload);
                // Refresh queue on any change (simple strategy)
                fetchQueue();
            })
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, [supabase, user]);


    // ACTIONS

    const raiseHand = async () => {
        if (!user || status !== 'idle') return;

        try {
            setStatus('waiting');
            const { error } = await supabase.from('live_interactions').insert({
                user_id: user.id,
                user_name: profile?.full_name || user.email || 'Anonymous',
                peer_id: user.id, // Using user_id as peer_id
                status: 'waiting'
            });

            if (error) throw error;
        } catch (error) {
            console.error("Error raising hand:", error);
            setStatus('idle'); // Revert
            alert("Failed to join queue.");
        }
    };

    // Teacher calls Student
    const acceptStudent = async (studentInteraction: LiveInteraction) => {
         if (!peerRef.current) return;

         try {
             // 1. Update DB to 'live'
             const { error } = await supabase
                .from('live_interactions')
                .update({ status: 'live' })
                .eq('id', studentInteraction.id);
            
            if (error) throw error;

            // 2. Call the student
            // To be nice, we can also send an empty audio stream or a mic stream if teacher wants to talk back
            // For now, let's try to get mic to allow 2-way
            let stream;
            try {
                stream = await navigator.mediaDevices.getUserMedia({ audio: true });
                localStreamRef.current = stream;
            } catch (e) {
                console.warn("Teacher mic not found, sending receive-only", e);
                // If teacher has no mic, we can still call
            }

            const call = peerRef.current.call(studentInteraction.peer_id, stream!); // stream can be undefined if receive-only? PeerJS might require a stream for call.
            // If PeerJS requires stream, and teacher has none, we might need a dummy stream. 
            // Usually teacher has mic.
            
            activeCallRef.current = call;
            setCurrentSpeaker(studentInteraction);

            call.on('stream', (studentStream) => {
                 // Play student's voice on Teacher's device
                 if (remoteAudioRef.current) {
                    remoteAudioRef.current.srcObject = studentStream;
                    remoteAudioRef.current.play();
                 }
            });

            call.on('close', () => {
                // Handle closure
                setCurrentSpeaker(null);
            });

         } catch (e) {
             console.error("Error accepting student", e);
         }
    };

    const endCall = async () => {
        // 1. Close Peer Connection
        if (activeCallRef.current) {
            activeCallRef.current.close();
            activeCallRef.current = null;
        }

        handleEndCallCleanup();

        // 2. Update DB (if I am the active speaker or admin)
        if (currentSpeaker) {
             const { error } = await supabase
                .from('live_interactions')
                .update({ status: 'ended' })
                .eq('id', currentSpeaker.id);
        } else if (status === 'waiting' && user) {
             // Cancel waiting
             const { error } = await supabase
                .from('live_interactions')
                .update({ status: 'ended' })
                .eq('user_id', user.id)
                .eq('status', 'waiting');
        }
    };

     const handleEndCallCleanup = () => {
        if (localStreamRef.current) {
            localStreamRef.current.getTracks().forEach(track => track.stop());
            localStreamRef.current = null;
        }
        setStatus('idle');
        setCurrentSpeaker(null);
    };

    const toggleMute = () => {
        if (localStreamRef.current) {
            localStreamRef.current.getAudioTracks().forEach(track => {
                track.enabled = !isMuted;
            });
            setIsMuted(!isMuted);
        }
    };

    return {
        status,
        queue,
        currentSpeaker,
        raiseHand,
        acceptStudent,
        endCall,
        toggleMute,
        isMuted,
        peerId,
        connectionError
    };
};
