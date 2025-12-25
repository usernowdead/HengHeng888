"use client";

import React, { useState, useEffect } from 'react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '../ui/dialog';
import { Badge } from '../ui/badge';
import { Separator } from '../ui/separator';
import { ScrollArea } from '../ui/scroll-area';
import { toast } from 'sonner';
import { useAuth } from '@/context/AuthContext';
import { TopupGame } from './TopupGameCard';

interface TopupGameDialogProps {
    game: TopupGame | null;
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

interface FormData {
    [key: string]: string;
}

export function TopupGameDialog({ game, open, onOpenChange }: TopupGameDialogProps) {
    const { isAuth, user } = useAuth();
    const [selectedItem, setSelectedItem] = useState<string>('');
    const [formData, setFormData] = useState<FormData>({});
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (game && open) {
            // Reset form when dialog opens
            setSelectedItem('');
            setFormData({});
        }
    }, [game, open]);

    const handleInputChange = (key: string, value: string) => {
        setFormData(prev => ({
            ...prev,
            [key]: value
        }));
    };

    const handlePurchase = async () => {
        if (!isAuth) {
            toast.error('กรุณาเข้าสู่ระบบก่อนทำการสั่งซื้อ');
            return;
        }

        if (!selectedItem) {
            toast.error('กรุณาเลือกแพ็คเกจ');
            return;
        }

        // Validate required inputs
        const missingInputs = game?.inputs.filter(input =>
            !formData[input.key] || formData[input.key].trim() === ''
        );

        if (missingInputs && missingInputs.length > 0) {
            toast.error(`กรุณากรอกข้อมูล: ${missingInputs.map(input => input.title).join(', ')}`);
            return;
        }

        setLoading(true);

        try {
            const response = await fetch('/api/v1/topup/buy', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                },
                body: JSON.stringify({
                    product_key: game?.key,
                    item_sku: selectedItem,
                    input: formData
                })
            });

            const data = await response.json();

            if (data.success) {
                toast.success('สั่งซื้อสำเร็จ!');
                onOpenChange(false);
            } else {
                toast.error(data.message || 'การสั่งซื้อล้มเหลว');
            }
        } catch (error) {
            console.error('Purchase error:', error);
            toast.error('เกิดข้อผิดพลาดในการสั่งซื้อ');
        } finally {
            setLoading(false);
        }
    };

    const selectedItemData = game?.items.find(item => item.sku === selectedItem);

    // Get game image based on game name and key
    const getGameImage = (gameName: string, gameKey?: string) => {
        const name = gameName.toLowerCase();
        
        // Game name to image file mapping (specific mappings for known games)
        const gameImageMap: Record<string, string> = {
            // Valorant
            'valorant': 'https://img5.pic.in.th/file/secure-sv1/202411162114373GUYTE6BVGEZF6USJJ5KCAVTBNRXXEYLOOQQDCOJNHEWTEMBSGI.png',
            
            // Arena Breakout
            'arena breakout': 'https://img2.pic.in.th/pic/arena-breakout-new.jpg',
            'arena breakout infinite': 'https://img5.pic.in.th/file/secure-sv1/arena-breakout-infinite.png',
            
            // Call of Duty
            'call of duty': 'https://img2.pic.in.th/pic/call-of-duty-m.png',
            'call of duty mobile': 'https://img2.pic.in.th/pic/call-of-duty-m.png',
            'cod': 'https://img2.pic.in.th/pic/call-of-duty-m.png',
            'codm': 'https://img2.pic.in.th/pic/call-of-duty-m.png',
            
            // Delta Force
            'delta force': 'https://img2.pic.in.th/pic/delta-force-garena.png',
            'delta force garena': 'https://img2.pic.in.th/pic/delta-force-garena.png',
            'delta force steam': 'https://img5.pic.in.th/file/secure-sv1/delta-force-steam.jpg',
            
            // Dragon Nest
            'dragon nest': 'https://img5.pic.in.th/file/secure-sv1/dragon-nest-m-classic.jpg',
            'dragon nest m': 'https://img5.pic.in.th/file/secure-sv1/dragon-nest-m-classic.jpg',
            
            // Dragon Raja
            'dragon raja': 'https://img5.pic.in.th/file/secure-sv1/202411162105099Dragon-Raja.png',
            
            // Free Fire
            'free fire': 'https://img5.pic.in.th/file/secure-sv1/free-fire-new.jpg',
            'freefire': 'https://img5.pic.in.th/file/secure-sv1/free-fire-new.jpg',
            'ff': 'https://img5.pic.in.th/file/secure-sv1/free-fire-new.jpg',
            
            // Haikyu
            'haikyu': 'https://img5.pic.in.th/file/secure-sv1/haikyu-flyhigh.png',
            'haikyu fly high': 'https://img5.pic.in.th/file/secure-sv1/haikyu-flyhigh.png',
            
            // League of Legends
            'league of legends': 'https://img2.pic.in.th/pic/league-of-legends-new.jpg',
            'lol': 'https://img2.pic.in.th/pic/league-of-legends-new.jpg',
            'wild rift': 'https://img2.pic.in.th/pic/lol_wild_rift_logo.jpeg',
            'lol wild rift': 'https://img2.pic.in.th/pic/lol_wild_rift_logo.jpeg',
            
            // Lord Nine
            'lord nine': 'https://img2.pic.in.th/pic/lord-nine.png',
            
            // Magic Chess
            'magic chess': 'https://img5.pic.in.th/file/secure-sv1/magic-chess-go-go.jpg',
            'magic chess go go': 'https://img5.pic.in.th/file/secure-sv1/magic-chess-go-go.jpg',
            
            // Mobile Legends
            'mobile legends': 'https://img5.pic.in.th/file/secure-sv1/mobile_legends_logo.jpg',
            'mobile legends bang bang': 'https://img5.pic.in.th/file/secure-sv1/mobile_legends_logo.jpg',
            'ml': 'https://img5.pic.in.th/file/secure-sv1/mobile_legends_logo.jpg',
            'mlbb': 'https://img5.pic.in.th/file/secure-sv1/mobile_legends_logo.jpg',
            
            // PUBG Mobile
            'pubg': 'https://img2.pic.in.th/pic/pubg-mobile-new.jpg',
            'pubg mobile': 'https://img2.pic.in.th/pic/pubg-mobile-new.jpg',
            'pubg mobile global': 'https://img5.pic.in.th/file/secure-sv1/pubg-mobile-global-newfaaab32af0304a06.jpg',
            'battlegrounds': 'https://img2.pic.in.th/pic/pubg-mobile-new.jpg',
            
            // Racing Master
            'racing master': '/GAME/racing-master.jpg',
            
            // Ragnarok
            'ragnarok': 'https://img5.pic.in.th/file/secure-sv1/ragnarok-m-classic.jpg',
            'ragnarok m': 'https://img5.pic.in.th/file/secure-sv1/ragnarok-m-classic.jpg',
            'ro': 'https://img5.pic.in.th/file/secure-sv1/ragnarok-m-classic.jpg',
            
            // Roblox
            'roblox': 'https://img2.pic.in.th/pic/roblox2a1bc020c3f657a8.png',
            
            // ROV (Arena of Valor)
            'rov': 'https://img2.pic.in.th/pic/20221128063554987_rov_mobile_appicon.png',
            'arena of valor': 'https://img2.pic.in.th/pic/20221128063554987_rov_mobile_appicon.png',
            'aov': 'https://img2.pic.in.th/pic/20221128063554987_rov_mobile_appicon.png',
            
            // Sword of Justice
            'sword of justice': 'https://img5.pic.in.th/file/secure-sv1/sword-of-justice.jpg',
            
            // Teamfight Tactics
            'teamfight tactics': 'https://img2.pic.in.th/pic/teamfight-tactics-mobile-new.jpg',
            'tft': 'https://img2.pic.in.th/pic/teamfight-tactics-mobile-new.jpg',
            'tft mobile': 'https://img2.pic.in.th/pic/teamfight-tactics-mobile-new.jpg',
            
            // Where Winds Meet
            'where winds meet': 'https://img2.pic.in.th/pic/where-winds-meet.jpg',
            
            // Cabal
            'cabal': 'https://img5.pic.in.th/file/secure-sv1/202411162132482Cabal-infinite-combo-TH.png',
            'cabal infinite combo': 'https://img5.pic.in.th/file/secure-sv1/202411162132482Cabal-infinite-combo-TH.png',
            
            // Eggy Party
            'eggy party': 'https://img2.pic.in.th/pic/202411162108236Eggy-Party-1.png',
            
            // FC Mobile
            'fc mobile': 'https://img5.pic.in.th/file/secure-sv1/fc-mobile.jpg',
            
            // Dunk City Dynasty
            'dunk city dynasty': 'https://img5.pic.in.th/file/secure-sv1/dunk-city-dynasty.jpg',
            
            // Draconia Saga
            'draconia saga': 'https://img2.pic.in.th/pic/draconia-saga011c35ad34b74f01.jpg',
            
            // Blood Strike
            'blood strike': 'https://img2.pic.in.th/pic/blood-strike.jpg',
            
            // AFK Journey
            'afk journey': 'https://img5.pic.in.th/file/secure-sv1/afk-journey.jpg',
            
            // Genshin Impact
            'genshin impact': 'https://img2.pic.in.th/pic/genshin-impact-new.jpg',
        };
        
        // Try exact match first
        if (gameImageMap[name]) {
            return gameImageMap[name];
        }
        
        // Try partial match
        for (const [key, imagePath] of Object.entries(gameImageMap)) {
            if (name.includes(key) || key.includes(name)) {
                return imagePath;
            }
        }
        
        // Try using game key if provided (most flexible approach - this will auto-detect new games)
        if (gameKey) {
            // Try exact key first - browser will handle onError if file doesn't exist
            return `/GAME/${gameKey}.jpg`;
        }
        
        // Fallback: try to normalize game name to match common file patterns
        const normalizedKey = name
            .replace(/\s+/g, '-')  // Replace spaces with hyphens
            .replace(/[^a-z0-9_-]/g, '')  // Remove special characters
            .toLowerCase();
        
        if (normalizedKey) {
            // Browser will handle onError if file doesn't exist
            return `/GAME/${normalizedKey}.jpg`;
        }
        
        // Default fallback
        return '/image-product-g.png';
    };

    if (!game) return null;

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-[calc(100vw-2rem)] sm:max-w-sm max-h-[90vh] p-0 gap-0 flex flex-col overflow-hidden">
                <div className="px-4 sm:px-6 pt-4 sm:pt-6 pb-3">
                    <DialogHeader className="pb-2">
                        <DialogTitle className="flex items-center gap-2 text-base sm:text-lg">
                            <img
                                src={getGameImage(game.name, game.key)}
                                className="w-5 h-5 sm:w-6 sm:h-6 rounded object-contain bg-white border shrink-0"
                                alt={game.name}
                                onError={(e) => {
                                    // If GAME folder image fails, try default
                                    if (e.currentTarget.src.includes('/GAME/')) {
                                        e.currentTarget.src = '/image-product-g.png';
                                    }
                                }}
                            />
                            <span className="line-clamp-1">{game.name}</span>
                        </DialogTitle>
                        <DialogDescription className="text-xs sm:text-sm">
                            เลือกแพ็คเกจและกรอกข้อมูลเพื่อทำการเติมเกม
                        </DialogDescription>
                    </DialogHeader>
                </div>

                <ScrollArea className="flex-1 px-4 sm:px-6 overflow-y-auto">
                    <div className="space-y-3 pb-2">
                        {/* Package Selection */}
                        <div className="space-y-1.5">
                            <Label className="text-xs sm:text-sm">เลือกแพ็คเกจ *</Label>
                            <Select value={selectedItem} onValueChange={setSelectedItem}>
                                <SelectTrigger className="h-9 sm:h-10 text-sm">
                                    <SelectValue placeholder="เลือกแพ็คเกจ" />
                                </SelectTrigger>
                                <SelectContent>
                                    {game.items.map((item) => (
                                        <SelectItem key={item.sku} value={item.sku}>
                                            <div className="flex justify-between items-center w-full">
                                                <span className="text-xs sm:text-sm">{item.name}</span>
                                                <Badge variant="secondary" className="ml-2 text-[10px] px-1.5 py-0">
                                                    ฿ {parseFloat(item.price).toFixed(2)}
                                                </Badge>
                                            </div>
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        {/* Dynamic Inputs */}
                        {game.inputs.map((input) => (
                            <div key={input.key} className="space-y-1.5">
                                <Label className="text-xs sm:text-sm">{input.title} {input.key === 'uid' ? '*' : ''}</Label>
                                {input.type === 'select' && input.options ? (
                                    <Select
                                        value={formData[input.key] || ''}
                                        onValueChange={(value) => handleInputChange(input.key, value)}
                                    >
                                        <SelectTrigger className="h-9 sm:h-10 text-sm">
                                            <SelectValue placeholder={input.placeholder} />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {input.options.map((option) => (
                                                <SelectItem key={option.value} value={option.value}>
                                                    {option.label}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                ) : (
                                    <Input
                                        type={input.type === 'number' ? 'number' : 'text'}
                                        placeholder={input.placeholder}
                                        value={formData[input.key] || ''}
                                        onChange={(e) => handleInputChange(input.key, e.target.value)}
                                        required={input.key === 'uid'}
                                        className="h-9 sm:h-10 text-sm"
                                    />
                                )}
                            </div>
                        ))}

                        <Separator />

                        {/* Balance Check */}
                        {isAuth && user && (
                            <div className="bg-gray-50 p-2.5 rounded-lg">
                                <div className="flex justify-between items-center text-xs sm:text-sm">
                                    <span>ยอดคงเหลือ:</span>
                                    <span className="font-medium">฿ {user.balance?.toFixed(2) || '0.00'}</span>
                                </div>
                                {selectedItemData && (
                                    <div className="flex justify-between items-center text-xs sm:text-sm mt-1">
                                        <span>ราคา:</span>
                                        <span className="font-medium text-red-600">
                                            -฿ {parseFloat(selectedItemData.price).toFixed(2)}
                                        </span>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </ScrollArea>

                {/* Purchase Button */}
                <div className="px-4 sm:px-6 py-4 space-y-2.5 border-t bg-gray-50/50">
                    <Button
                        onClick={handlePurchase}
                        disabled={!isAuth || loading || !selectedItem}
                        className="w-full text-sm h-11 font-medium shadow-sm"
                    >
                        {loading ? 'กำลังดำเนินการ...' : isAuth ? 'เติมเกม' : 'กรุณาเข้าสู่ระบบ'}
                    </Button>
                    <Button
                        variant="outline"
                        onClick={() => onOpenChange(false)}
                        disabled={loading}
                        className="w-full text-sm h-11 font-medium"
                    >
                        ปิด
                    </Button>
                    {!isAuth && (
                        <p className="text-[10px] sm:text-xs text-center text-muted-foreground pt-1">
                            กรุณาเข้าสู่ระบบก่อนทำการสั่งซื้อ
                        </p>
                    )}
                </div>
            </DialogContent>
        </Dialog>
    );
}


