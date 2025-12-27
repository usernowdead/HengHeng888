import React, { useState } from 'react';
import { Badge } from '../ui/badge';

export interface TopupGame {
    name: string;
    key: string;
    items: {
        name: string;
        sku: string;
        price: string;
    }[];
    inputs: {
        key: string;
        title: string;
        type: string;
        placeholder: string;
        options?: {
            label: string;
            value: string;
        }[];
    }[];
}

interface TopupGameCardProps {
    game: TopupGame;
    onClick: (game: TopupGame) => void;
}

// Component to handle image loading with multiple fallback attempts
function GameImage({ gameName, gameKey, className, alt, getGameImage }: { 
    gameName: string; 
    gameKey?: string; 
    className?: string; 
    alt: string;
    getGameImage: (name: string, key?: string) => string;
}) {
    const [currentSrc, setCurrentSrc] = useState<string>(() => getGameImage(gameName, gameKey));
    const [attempts, setAttempts] = useState(0);
    
    const getImagePaths = (name: string, key?: string): string[] => {
        const nameLower = name.toLowerCase();
        const paths: string[] = [];
        
        // First try the mapped image from getGameImage
        const mappedImage = getGameImage(name, key);
        if (mappedImage && mappedImage !== '/image-product-g.png') {
            paths.push(mappedImage);
        }
        
        // Try game key first (most reliable) - this will auto-detect new games
        if (key) {
            const keyLower = key.toLowerCase();
            // Try multiple patterns - prioritize exact match first
            paths.push(
                `/GAME/${key}.jpg`,
                `/GAME/${key}.png`,
                `/GAME/${key}.jpeg`,
                `/GAME/${keyLower}.jpg`,
                `/GAME/${keyLower}.png`,
                `/GAME/${keyLower}.jpeg`,
                `/GAME/${keyLower.replace(/_/g, '-')}.jpg`,
                `/GAME/${keyLower.replace(/-/g, '_')}.jpg`,
                `/GAME/${keyLower.replace(/_/g, '-')}.png`,
                `/GAME/${keyLower.replace(/-/g, '_')}.png`,
            );
        }
        
        // Try normalized game name
        const normalized = nameLower
            .replace(/\s+/g, '-')
            .replace(/[^a-z0-9_-]/g, '');
        
        if (normalized) {
            paths.push(
                `/GAME/${normalized}.jpg`,
                `/GAME/${normalized}.png`,
                `/GAME/${normalized}.jpeg`,
            );
        }
        
        // Remove duplicates
        return [...new Set(paths)];
    };
    
    React.useEffect(() => {
        const initialSrc = getGameImage(gameName, gameKey);
        setCurrentSrc(initialSrc);
        setAttempts(0);
    }, [gameName, gameKey, getGameImage]);
    
    const handleError = () => {
        const paths = getImagePaths(gameName, gameKey);
        const nextAttempt = attempts + 1;
        
        if (nextAttempt < paths.length) {
            setAttempts(nextAttempt);
            setCurrentSrc(paths[nextAttempt]);
        } else {
            setCurrentSrc('/image-product-g.png');
        }
    };
    
    return (
        <img 
            src={currentSrc} 
            className={`${className} select-none`} 
            alt={alt} 
            draggable={false}
            onContextMenu={(e) => {
                e.preventDefault();
                return false;
            }}
            onDragStart={(e) => {
                e.preventDefault();
                return false;
            }}
            onError={handleError} 
            key={`${currentSrc}-${attempts}`} 
        />
    );
}

export function TopupGameCard({ game, onClick }: TopupGameCardProps) {
    // Get the minimum price from items
    const minPrice = Math.min(...game.items.map(item => parseFloat(item.price) || 0));
    const maxPrice = Math.max(...game.items.map(item => parseFloat(item.price) || 0));

    const formatPrice = (price: number) => {
        return new Intl.NumberFormat('th-TH', {
            style: 'currency',
            currency: 'THB'
        }).format(price);
    };

    // Get game image based on game name and key
    const getGameImage = (gameName: string, gameKey?: string) => {
        const name = gameName.toLowerCase();
        
        // Game name to image file mapping (all paths use /GAME/ folder)
        const gameImageMap: Record<string, string> = {
            // Valorant
            'valorant': '/GAME/202411162114373GUYTE6BVGEZF6USJJ5KCAVTBNRXXEYLOOQQDCOJNHEWTEMBSGI======.png',
            
            // Arena Breakout
            'arena breakout': '/GAME/arena-breakout-new.jpg',
            'arena breakout infinite': '/GAME/arena-breakout-infinite.png',
            
            // Call of Duty
            'call of duty': '/GAME/call-of-duty-m.png',
            'call of duty mobile': '/GAME/call-of-duty-m.png',
            'cod': '/GAME/call-of-duty-m.png',
            'codm': '/GAME/call-of-duty-m.png',
            
            // Delta Force
            'delta force': '/GAME/delta-force-garena.png',
            'delta force garena': '/GAME/delta-force-garena.png',
            'delta force steam': '/GAME/delta-force-steam.jpg',
            
            // Dragon Nest
            'dragon nest': '/GAME/dragon-nest-m-classic.jpg',
            'dragon nest m': '/GAME/dragon-nest-m-classic.jpg',
            
            // Free Fire
            'free fire': '/GAME/free-fire-new.jpg',
            'freefire': '/GAME/free-fire-new.jpg',
            'ff': '/GAME/free-fire-new.jpg',
            
            // Haikyu
            'haikyu': '/GAME/haikyu-flyhigh.png',
            'haikyu fly high': '/GAME/haikyu-flyhigh.png',
            
            // League of Legends
            'league of legends': '/GAME/league-of-legends-new.jpg',
            'lol': '/GAME/league-of-legends-new.jpg',
            'wild rift': '/GAME/lol_wild_rift_logo.jpeg',
            'lol wild rift': '/GAME/lol_wild_rift_logo.jpeg',
            
            // Lord Nine
            'lord nine': '/GAME/lord-nine.png',
            
            // Magic Chess
            'magic chess': '/GAME/magic-chess-go-go.jpg',
            'magic chess go go': '/GAME/magic-chess-go-go.jpg',
            
            // Mobile Legends
            'mobile legends': '/GAME/mobile_legends_logo.jpg',
            'mobile legends bang bang': '/GAME/mobile_legends_logo.jpg',
            'ml': '/GAME/mobile_legends_logo.jpg',
            'mlbb': '/GAME/mobile_legends_logo.jpg',
            
            // PUBG Mobile
            'pubg': '/GAME/pubg-mobile-new.jpg',
            'pubg mobile': '/GAME/pubg-mobile-new.jpg',
            'pubg mobile global': '/GAME/pubg-mobile-global-new.jpg',
            'battlegrounds': '/GAME/pubg-mobile-new.jpg',
            
            // Racing Master
            'racing master': '/GAME/racing-master.jpg',
            
            // Ragnarok
            'ragnarok': '/GAME/ragnarok-m-classic.jpg',
            'ragnarok m': '/GAME/ragnarok-m-classic.jpg',
            'ro': '/GAME/ragnarok-m-classic.jpg',
            
            // Roblox
            'roblox': '/GAME/roblox.png',
            
            // ROV (Arena of Valor)
            'rov': '/GAME/20221128063554987_rov_mobile_appicon.png',
            'arena of valor': '/GAME/20221128063554987_rov_mobile_appicon.png',
            'aov': '/GAME/20221128063554987_rov_mobile_appicon.png',
            
            // Sword of Justice
            'sword of justice': '/GAME/sword-of-justice.jpg',
            
            // Teamfight Tactics
            'teamfight tactics': '/GAME/teamfight-tactics-mobile-new.jpg',
            'tft': '/GAME/teamfight-tactics-mobile-new.jpg',
            'tft mobile': '/GAME/teamfight-tactics-mobile-new.jpg',
            
            // Where Winds Meet
            'where winds meet': '/GAME/where-winds-meet.jpg',
            
            // Cabal
            'cabal': '/GAME/202411162132482Cabal infinite combo (TH).png',
            'cabal infinite combo': '/GAME/202411162132482Cabal infinite combo (TH).png',
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
            const keyLower = gameKey.toLowerCase();
            // Try multiple patterns and extensions - system will try these in order
            // Browser will handle onError if file doesn't exist
            return `/GAME/${gameKey}.jpg`; // Try exact key first
        }
        
        // Fallback: try to normalize game name to match common file patterns
        const normalizedKey = name
            .replace(/\s+/g, '-')  // Replace spaces with hyphens
            .replace(/[^a-z0-9_-]/g, '')  // Remove special characters
            .toLowerCase();
        
        if (normalizedKey) {
            // Try multiple extensions - browser will handle onError
            return `/GAME/${normalizedKey}.jpg`;
        }
        
        // Default fallback
        return '/image-product-g.png';
    };

    return (
        <div
            className='group relative overflow-hidden border p-3 cursor-pointer rounded-md hover:bg-gray-50 transition-colors'
            onClick={() => onClick(game)}
        >
            <div className='flex flex-col items-center text-center gap-2.5'>
                <GameImage 
                    gameName={game.name}
                    gameKey={game.key}
                    className='w-12 h-12 border p-1 rounded-md shrink-0 object-contain bg-white'
                    alt={game.name}
                    getGameImage={getGameImage}
                />

                <div className='w-full min-w-0'>
                    <h4 className='font-medium text-sm line-clamp-2 mb-2'>
                        {game.name}
                    </h4>

                    <div className='flex flex-col items-center gap-2 text-xs'>
                        <Badge variant="outline" className='text-xs rounded-md px-2 py-1'>
                            {game.items.length} แพ็คเกจ
                        </Badge>

                        {minPrice === maxPrice ? (
                            <Badge variant="secondary" className='text-xs px-2 py-1'>
                                ฿ {minPrice.toFixed(2)}
                            </Badge>
                        ) : (
                            <Badge variant="secondary" className='text-xs px-2 py-1 line-clamp-1'>
                                ฿ {minPrice.toFixed(2)} - ฿ {maxPrice.toFixed(2)}
                            </Badge>
                        )}
                    </div>

                    {game.inputs.length > 0 && (
                        <p className='text-xs text-muted-foreground mt-2 line-clamp-1'>
                            ต้องใส่: {game.inputs.map(input => input.title).join(', ')}
                        </p>
                    )}
                </div>
            </div>
        </div>
    );
}
