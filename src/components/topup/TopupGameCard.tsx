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
