
import React, { useState, useEffect, useRef } from 'react';
import { Page, ChatMessage, User } from '../types';
import { isSupabaseConfigured, fetchMessages, sendMessage, subscribeToMessages, supabase } from '../services/supabase';

interface ChatProps {
    user: User | null;
    onNavigate: (page: Page) => void;
}

const Chat: React.FC<ChatProps> = ({ user, onNavigate }) => {
    const [messages, setMessages] = useState<ChatMessage[]>([]);
    const [newMessage, setNewMessage] = useState('');
    const [isLoading, setIsLoading] = useState(true);
    const [isSending, setIsSending] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const [connectionStatus, setConnectionStatus] = useState<'CONNECTING' | 'SUBSCRIBED' | 'CLOSED' | 'ERROR'>('CONNECTING');
    const [lastError, setLastError] = useState<string | null>(null);

    useEffect(() => {
        loadMessages();

        // Subscribe to realtime messages
        if (isSupabaseConfigured() && user?.id) {
            const channel = subscribeToMessages(
                (message) => {
                    // Only add message if it belongs to this user
                    // (Sender is me OR Recipient is me)
                    // (Or if it's a broadcast to everyone, though we don't have that yet)
                    if (message.senderId === user.id || message.recipientId === user.id) {
                        setMessages(prev => {
                            // prevent duplicates just in case
                            if (prev.some(m => m.id === message.id)) return prev;
                            return [...prev, message];
                        });
                    }
                },
                (status) => {
                    setConnectionStatus(status);
                    if (status === 'ERROR') setLastError('Erro na conexão em tempo real');
                }
            );

            return () => {
                if (channel) supabase?.removeChannel(channel);
            };
        }
    }, [user?.id]);

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    const loadMessages = async () => {
        setIsLoading(true);
        if (isSupabaseConfigured()) {
            const data = await fetchMessages(user?.id);
            setMessages(data);
        }
        setIsLoading(false);
    };

    const handleSend = async () => {
        if (!newMessage.trim()) return;

        setIsSending(true);

        const messageData = {
            senderId: user?.id,
            senderName: user?.name || 'Morador',
            senderBlock: user?.block,
            senderApartment: user?.apartment,
            content: newMessage.trim(),
            isFromAdmin: user?.isAdmin || false,
        };

        if (isSupabaseConfigured()) {
            const sent = await sendMessage(messageData);
            if (sent) {
                // Message will appear via realtime subscription
                setNewMessage('');
            }
        } else {
            // Offline mode - simulate message
            const fakeMessage: ChatMessage = {
                id: Math.random().toString(36).substr(2, 9),
                ...messageData,
                createdAt: new Date().toISOString(),
            };
            setMessages(prev => [...prev, fakeMessage]);
            setNewMessage('');
        }

        setIsSending(false);
    };

    const formatTime = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
    };

    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        const today = new Date();
        const yesterday = new Date(today);
        yesterday.setDate(yesterday.getDate() - 1);

        if (date.toDateString() === today.toDateString()) {
            return 'Hoje';
        } else if (date.toDateString() === yesterday.toDateString()) {
            return 'Ontem';
        }
        return date.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' });
    };

    // Group messages by date
    const groupedMessages: { date: string; messages: ChatMessage[] }[] = [];
    let currentDate = '';
    messages.forEach(msg => {
        const msgDate = formatDate(msg.createdAt);
        if (msgDate !== currentDate) {
            currentDate = msgDate;
            groupedMessages.push({ date: msgDate, messages: [msg] });
        } else {
            groupedMessages[groupedMessages.length - 1].messages.push(msg);
        }
    });

    return (
        <div className="max-w-[480px] mx-auto min-h-screen bg-background-light dark:bg-background-dark flex flex-col">
            {/* Header */}
            <header className="sticky top-0 z-40 bg-primary p-4">
                <div className="flex items-center justify-between">
                    <button
                        onClick={() => onNavigate(Page.HOME)}
                        className="size-10 bg-white/20 rounded-xl flex items-center justify-center text-white"
                    >
                        <span className="material-symbols-outlined">arrow_back</span>
                    </button>
                    <div className="text-center flex-1">
                        <h1 className="text-white text-lg font-extrabold">Chat com a Padaria</h1>
                        <p className="text-white/70 text-xs">Tire suas dúvidas</p>
                    </div>
                    <button
                        onClick={loadMessages}
                        className="size-10 bg-white/20 rounded-xl flex items-center justify-center text-white"
                    >
                        <span className="material-symbols-outlined">refresh</span>
                    </button>
                </div>
            </header>

            {/* Connection Status */}
            <div className={`mx-4 mt-4 p-2 rounded-lg flex flex-col gap-1 text-xs ${!isSupabaseConfigured() ? 'bg-amber-100 text-amber-700' :
                connectionStatus === 'SUBSCRIBED' ? 'bg-green-100 text-green-700' :
                    connectionStatus === 'ERROR' ? 'bg-red-100 text-red-700' :
                        'bg-blue-100 text-blue-700'
                }`}>
                <div className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-sm">
                        {!isSupabaseConfigured() ? 'cloud_off' :
                            connectionStatus === 'SUBSCRIBED' ? 'cloud_done' :
                                connectionStatus === 'ERROR' ? 'error' : 'sync'}
                    </span>
                    <span className="font-bold">
                        {!isSupabaseConfigured() ? 'Modo demonstração (Offline)' :
                            connectionStatus === 'SUBSCRIBED' ? 'Chat Online' :
                                connectionStatus === 'ERROR' ? 'Erro de Conexão' :
                                    'Conectando...'}
                    </span>
                </div>
                {lastError && <span className="text-[10px] font-mono mt-1">{lastError}</span>}
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 pb-24">
                {isLoading ? (
                    <div className="flex items-center justify-center h-full">
                        <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
                    </div>
                ) : messages.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-full text-center">
                        <span className="material-symbols-outlined text-5xl text-warm-accent/40 mb-4">chat</span>
                        <h3 className="font-bold text-[#1d180c] dark:text-white mb-2">Nenhuma mensagem</h3>
                        <p className="text-warm-accent text-sm">Envie uma mensagem para começar a conversa!</p>
                    </div>
                ) : (
                    <>
                        {groupedMessages.map((group, groupIdx) => (
                            <div key={groupIdx}>
                                {/* Date Separator */}
                                <div className="flex items-center gap-4 my-4">
                                    <div className="flex-1 h-px bg-warm-accent/20"></div>
                                    <span className="text-xs text-warm-accent font-bold">{group.date}</span>
                                    <div className="flex-1 h-px bg-warm-accent/20"></div>
                                </div>

                                {/* Messages */}
                                {group.messages.map((msg) => {
                                    const isMyMessage = msg.senderId === user?.id || (!msg.isFromAdmin && !user?.isAdmin);

                                    return (
                                        <div
                                            key={msg.id}
                                            className={`flex mb-3 ${isMyMessage ? 'justify-end' : 'justify-start'}`}
                                        >
                                            <div
                                                className={`max-w-[80%] p-3 rounded-2xl ${isMyMessage
                                                    ? 'bg-primary text-white rounded-br-md'
                                                    : 'bg-white dark:bg-[#383330] text-[#1d180c] dark:text-white rounded-bl-md shadow-sm'
                                                    }`}
                                            >
                                                {/* Sender Info (for admin messages) */}
                                                {msg.isFromAdmin && (
                                                    <p className={`text-[10px] font-bold mb-1 ${isMyMessage ? 'text-white/70' : 'text-primary'}`}>
                                                        🥖 Pão e Cia
                                                    </p>
                                                )}
                                                {!msg.isFromAdmin && !isMyMessage && (
                                                    <p className={`text-[10px] font-bold mb-1 text-primary`}>
                                                        {msg.senderName} - Bloco {msg.senderBlock}, Apt {msg.senderApartment}
                                                    </p>
                                                )}

                                                {/* Message Content */}
                                                <p className="text-sm whitespace-pre-wrap">{msg.content}</p>

                                                {/* Time */}
                                                <p className={`text-[10px] mt-1 ${isMyMessage ? 'text-white/60' : 'text-warm-accent'}`}>
                                                    {formatTime(msg.createdAt)}
                                                </p>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        ))}
                        <div ref={messagesEndRef} />
                    </>
                )}
            </div>

            {/* Input Area */}
            <div className="fixed bottom-16 md:bottom-0 left-0 right-0 bg-white dark:bg-[#1d180c] border-t border-warm-accent/20 p-4">
                <div className="max-w-[480px] mx-auto flex gap-3">
                    <input
                        type="text"
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && !isSending && handleSend()}
                        className="flex-1 h-12 px-4 rounded-xl bg-background-light dark:bg-[#383330] border border-warm-accent/20 focus:ring-2 focus:ring-primary outline-none text-[#1d180c] dark:text-white"
                        placeholder="Digite sua mensagem..."
                        disabled={isSending}
                    />
                    <button
                        onClick={handleSend}
                        disabled={isSending || !newMessage.trim()}
                        className={`h-12 w-12 bg-primary text-white rounded-xl flex items-center justify-center shadow-lg shadow-primary/30 ${isSending || !newMessage.trim() ? 'opacity-50' : 'hover:bg-primary/90'
                            }`}
                    >
                        {isSending ? (
                            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        ) : (
                            <span className="material-symbols-outlined">send</span>
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default Chat;
