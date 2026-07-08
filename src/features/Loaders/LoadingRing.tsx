import React from 'react';
import { motion, useMotionValue } from 'framer-motion';

interface RingLoaderProps {
    size?: number;
    speed?: number;
    color?: string;
}

const RingLoader: React.FC<RingLoaderProps> = ({ size = 40, speed = 3, color = '#12B963' }) => {
    const rotate = useMotionValue(0);

    return (
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', margin: '0 auto' }}>
            <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: speed, repeat: Infinity, ease: 'linear' }}
                style={{ width: size, height: size, border: `2px solid ${color}`, borderRadius: '50%', borderLeftColor: 'transparent', borderWidth: 3 }}
            />
        </div>
    );
};

export default RingLoader;