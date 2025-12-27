import { useState } from 'react';

// Mock hook - No external dependencies
export const useAgora = (client: any) => {
    const [active, setActive] = useState(false);

    const joinChannel = async (channelName: string, uid: string | number) => {
        console.log("Mock Join Channel:", channelName, uid);
        setActive(true);
    };

    const leaveChannel = async () => {
        console.log("Mock Leave Channel");
        setActive(false);
    };

    return {
        localAudioTrack: null,
        localVideoTrack: null,
        joinState: active,
        leaveChannel,
        joinChannel,
        remoteUsers: [],
    };
};
