'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/utils/supabase/client';

interface TestResult {
    name: string;
    status: 'PASS' | 'FAIL' | 'PENDING' | 'RUNNING';
    message: string;
    duration?: number;
}

export default function DebugPingPage() {
    const [logs, setLogs] = useState<string[]>([]);
    const [tests, setTests] = useState<TestResult[]>([
        { name: 'Test A: Client Integrity', status: 'PENDING', message: 'Waiting...' },
        { name: 'Test B: Network Latency', status: 'PENDING', message: 'Waiting...' },
        { name: 'Test C: Auth Session', status: 'PENDING', message: 'Waiting...' },
        { name: 'Test D: RLS Permissions', status: 'PENDING', message: 'Waiting...' },
    ]);
    const [isComplete, setIsComplete] = useState(false);

    const addLog = (message: string) => {
        const timestamp = new Date().toISOString().substring(11, 23);
        setLogs(prev => [...prev, `[${timestamp}] ${message}`]);
    };

    const updateTest = (index: number, updates: Partial<TestResult>) => {
        setTests(prev => prev.map((t, i) => i === index ? { ...t, ...updates } : t));
    };

    useEffect(() => {
        const runDiagnostics = async () => {
            addLog('╔══════════════════════════════════════════════════════════╗');
            addLog('║         SUPABASE CONNECTION DIAGNOSTIC INITIATED         ║');
            addLog('╚══════════════════════════════════════════════════════════╝');
            addLog('');

            // ═══════════════════════════════════════════════════════════════
            // TEST A: CLIENT INTEGRITY
            // ═══════════════════════════════════════════════════════════════
            addLog('▶ TEST A: Client Integrity Check...');
            updateTest(0, { status: 'RUNNING', message: 'Creating client instance...' });

            try {
                const supabase = createClient();
                if (supabase && typeof supabase.from === 'function' && typeof supabase.auth === 'object') {
                    updateTest(0, { status: 'PASS', message: 'Supabase client created successfully. Instance valid.' });
                    addLog('  ✓ Client instance created with .from() and .auth methods');
                } else {
                    updateTest(0, { status: 'FAIL', message: 'Client created but missing expected methods.' });
                    addLog('  ✗ Client is malformed or incomplete');
                }
            } catch (error) {
                const errMsg = error instanceof Error ? error.message : 'Unknown error';
                updateTest(0, { status: 'FAIL', message: `Failed to create client: ${errMsg}` });
                addLog(`  ✗ Error: ${errMsg}`);
            }
            addLog('');

            // ═══════════════════════════════════════════════════════════════
            // TEST B: NETWORK LATENCY
            // ═══════════════════════════════════════════════════════════════
            addLog('▶ TEST B: Network Latency Test...');
            updateTest(1, { status: 'RUNNING', message: 'Pinging profiles table...' });

            try {
                const supabase = createClient();
                const startTime = performance.now();
                const { count, error } = await supabase
                    .from('profiles')
                    .select('count', { count: 'exact', head: true });
                const endTime = performance.now();
                const latency = Math.round(endTime - startTime);

                if (error) {
                    updateTest(1, {
                        status: 'FAIL',
                        message: `Query failed: ${error.message}`,
                        duration: latency
                    });
                    addLog(`  ✗ Query error: ${error.message}`);
                    addLog(`  ⏱ Time elapsed: ${latency}ms`);
                } else {
                    updateTest(1, {
                        status: 'PASS',
                        message: `Response received. Count: ${count ?? 'N/A'}`,
                        duration: latency
                    });
                    addLog(`  ✓ Query successful`);
                    addLog(`  ⏱ Ping Time: ${latency}ms`);
                    addLog(`  📊 Profile count: ${count ?? 'N/A'}`);
                }
            } catch (error) {
                const errMsg = error instanceof Error ? error.message : 'Unknown error';
                updateTest(1, { status: 'FAIL', message: `Network error: ${errMsg}` });
                addLog(`  ✗ Network exception: ${errMsg}`);
            }
            addLog('');

            // ═══════════════════════════════════════════════════════════════
            // TEST C: AUTH SESSION
            // ═══════════════════════════════════════════════════════════════
            addLog('▶ TEST C: Auth Session Check...');
            updateTest(2, { status: 'RUNNING', message: 'Checking session...' });

            try {
                const supabase = createClient();
                const { data, error } = await supabase.auth.getSession();

                if (error) {
                    updateTest(2, { status: 'FAIL', message: `Session error: ${error.message}` });
                    addLog(`  ✗ Session error: ${error.message}`);
                } else if (data.session && data.session.user) {
                    const user = data.session.user;
                    updateTest(2, {
                        status: 'PASS',
                        message: `User authenticated: ${user.email}`
                    });
                    addLog(`  ✓ Active session found`);
                    addLog(`  👤 User ID: ${user.id}`);
                    addLog(`  📧 Email: ${user.email}`);
                    addLog(`  ⏰ Expires: ${new Date(data.session.expires_at! * 1000).toISOString()}`);
                } else {
                    updateTest(2, { status: 'FAIL', message: 'No active session. User not logged in.' });
                    addLog('  ✗ No active session found');
                    addLog('  ⚠ User is not authenticated');
                }
            } catch (error) {
                const errMsg = error instanceof Error ? error.message : 'Unknown error';
                updateTest(2, { status: 'FAIL', message: `Auth check failed: ${errMsg}` });
                addLog(`  ✗ Exception: ${errMsg}`);
            }
            addLog('');

            // ═══════════════════════════════════════════════════════════════
            // TEST D: RLS PERMISSIONS
            // ═══════════════════════════════════════════════════════════════
            addLog('▶ TEST D: RLS Permissions Test...');
            updateTest(3, { status: 'RUNNING', message: 'Fetching current user profile...' });

            try {
                const supabase = createClient();
                const { data: sessionData } = await supabase.auth.getSession();

                if (!sessionData.session?.user) {
                    updateTest(3, { status: 'FAIL', message: 'Cannot test RLS: No authenticated user.' });
                    addLog('  ✗ Skipped: No user session to test RLS');
                } else {
                    const userId = sessionData.session.user.id;
                    const { data, error, status } = await supabase
                        .from('profiles')
                        .select('*')
                        .eq('id', userId)
                        .single();

                    if (error) {
                        if (status === 403 || error.code === 'PGRST301') {
                            updateTest(3, { status: 'FAIL', message: `403 Forbidden: RLS policy blocking access.` });
                            addLog(`  ✗ HTTP 403: RLS policy denied access`);
                        } else if (error.code === 'PGRST116') {
                            updateTest(3, { status: 'FAIL', message: `Profile not found for user.` });
                            addLog(`  ✗ No profile row exists for this user`);
                        } else {
                            updateTest(3, { status: 'FAIL', message: `Error: ${error.message} (${error.code})` });
                            addLog(`  ✗ Query error: ${error.message}`);
                        }
                        addLog(`  📊 Status: ${status}`);
                    } else if (data) {
                        updateTest(3, {
                            status: 'PASS',
                            message: `Profile retrieved. Full Name: ${data.full_name || 'N/A'}`
                        });
                        addLog(`  ✓ RLS check passed - Profile data accessible`);
                        addLog(`  📋 Profile ID: ${data.id}`);
                        addLog(`  👤 Full Name: ${data.full_name || 'Not set'}`);
                        addLog(`  🎓 Role: ${data.role || 'Not set'}`);
                    } else {
                        updateTest(3, { status: 'FAIL', message: 'Query returned null data.' });
                        addLog('  ✗ Query returned null');
                    }
                }
            } catch (error) {
                const errMsg = error instanceof Error ? error.message : 'Unknown error';
                updateTest(3, { status: 'FAIL', message: `RLS test failed: ${errMsg}` });
                addLog(`  ✗ Exception: ${errMsg}`);
            }

            addLog('');
            addLog('═══════════════════════════════════════════════════════════');
            addLog('           DIAGNOSTIC SEQUENCE COMPLETE');
            addLog('═══════════════════════════════════════════════════════════');

            setIsComplete(true);
        };

        runDiagnostics();
    }, []);

    return (
        <div style={{
            minHeight: '100vh',
            backgroundColor: '#0a0a0a',
            color: '#00ff00',
            fontFamily: "'Consolas', 'Monaco', 'Courier New', monospace",
            padding: '24px',
            fontSize: '14px',
            lineHeight: '1.6',
        }}>
            {/* Header */}
            <div style={{
                borderBottom: '2px solid #00ff00',
                paddingBottom: '16px',
                marginBottom: '24px'
            }}>
                <h1 style={{
                    color: '#00ff00',
                    fontSize: '24px',
                    fontWeight: 'bold',
                    margin: 0,
                    textShadow: '0 0 10px #00ff00'
                }}>
                    SUPABASE_DIAGNOSTICS.exe
                </h1>
                <p style={{ color: '#888', margin: '8px 0 0 0' }}>
                    Connection Integrity Verification System v1.0
                </p>
            </div>

            {/* Test Results Panel */}
            <div style={{
                backgroundColor: '#111',
                border: '1px solid #333',
                padding: '16px',
                marginBottom: '24px',
                borderRadius: '4px'
            }}>
                <h2 style={{
                    color: '#0ff',
                    fontSize: '16px',
                    margin: '0 0 16px 0',
                    borderBottom: '1px solid #333',
                    paddingBottom: '8px'
                }}>
                    ▼ TEST RESULTS
                </h2>
                {tests.map((test, index) => (
                    <div key={index} style={{
                        display: 'flex',
                        alignItems: 'center',
                        marginBottom: '12px',
                        gap: '12px'
                    }}>
                        <span style={{
                            backgroundColor:
                                test.status === 'PASS' ? '#00ff00' :
                                    test.status === 'FAIL' ? '#ff0000' :
                                        test.status === 'RUNNING' ? '#ffff00' : '#666',
                            color: test.status === 'RUNNING' ? '#000' : '#000',
                            padding: '2px 8px',
                            fontWeight: 'bold',
                            minWidth: '70px',
                            textAlign: 'center',
                            fontSize: '12px',
                            animation: test.status === 'RUNNING' ? 'blink 1s infinite' : 'none',
                        }}>
                            {test.status}
                        </span>
                        <span style={{ color: '#fff', minWidth: '200px' }}>{test.name}</span>
                        <span style={{ color: '#aaa', flex: 1 }}>{test.message}</span>
                        {test.duration !== undefined && (
                            <span style={{
                                color: test.duration < 500 ? '#00ff00' : test.duration < 1000 ? '#ffff00' : '#ff0000',
                                fontWeight: 'bold'
                            }}>
                                {test.duration}ms
                            </span>
                        )}
                    </div>
                ))}
            </div>

            {/* Terminal Log */}
            <div style={{
                backgroundColor: '#000',
                border: '1px solid #333',
                padding: '16px',
                marginBottom: '24px',
                borderRadius: '4px',
                maxHeight: '400px',
                overflowY: 'auto'
            }}>
                <h2 style={{
                    color: '#0ff',
                    fontSize: '16px',
                    margin: '0 0 16px 0',
                    borderBottom: '1px solid #333',
                    paddingBottom: '8px'
                }}>
                    ▼ DIAGNOSTIC LOG
                </h2>
                {logs.map((log, index) => (
                    <div key={index} style={{
                        color: log.includes('✓') ? '#00ff00' :
                            log.includes('✗') ? '#ff5555' :
                                log.includes('⚠') ? '#ffff00' :
                                    log.includes('══') ? '#0ff' : '#00ff00',
                        whiteSpace: 'pre-wrap',
                        wordBreak: 'break-word'
                    }}>
                        {log}
                    </div>
                ))}
                {!isComplete && (
                    <div style={{ color: '#ffff00', animation: 'blink 1s infinite' }}>
                        ▌ Running diagnostics...
                    </div>
                )}
            </div>

            {/* CRITICAL WARNING */}
            {isComplete && (
                <div style={{
                    backgroundColor: '#330000',
                    border: '3px solid #ff0000',
                    padding: '24px',
                    textAlign: 'center',
                    borderRadius: '8px',
                    animation: 'pulse 2s infinite'
                }}>
                    <div style={{
                        color: '#ff0000',
                        fontSize: '28px',
                        fontWeight: 'bold',
                        textTransform: 'uppercase',
                        textShadow: '0 0 20px #ff0000',
                        marginBottom: '8px'
                    }}>
                        ⚠ CRITICAL WARNING ⚠
                    </div>
                    <div style={{
                        color: '#ff6666',
                        fontSize: '20px',
                        fontWeight: 'bold'
                    }}>
                        DIAGNOSIS COMPLETE. DELETE THIS PAGE IMMEDIATELY.
                    </div>
                    <div style={{
                        color: '#ff9999',
                        fontSize: '14px',
                        marginTop: '12px'
                    }}>
                        This diagnostic page exposes sensitive debugging information.<br />
                        Run: <code style={{ backgroundColor: '#000', padding: '4px 8px', color: '#ff0000' }}>
                            rm src/app/debug-ping/page.tsx
                        </code>
                    </div>
                </div>
            )}

            {/* CSS Animations */}
            <style jsx global>{`
        @keyframes blink {
          0%, 50% { opacity: 1; }
          51%, 100% { opacity: 0.3; }
        }
        @keyframes pulse {
          0%, 100% { box-shadow: 0 0 20px rgba(255, 0, 0, 0.5); }
          50% { box-shadow: 0 0 40px rgba(255, 0, 0, 0.8); }
        }
      `}</style>
        </div>
    );
}
