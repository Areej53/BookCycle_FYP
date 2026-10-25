import React, { useEffect, useState, useRef } from 'react';
import { Clock, AlertCircle } from 'lucide-react';

const RentalFlipCountdown = ({ 
  endDate, 
  size = 'normal', // 'normal' | 'compact' | 'small'
  showTitle = true,
  title = 'Rental Period Remaining',
  onExpire = null 
}) => {
  const [timeLeft, setTimeLeft] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
    isExpired: false
  });
  const hasCalledExpireRef = useRef(false);

  useEffect(() => {
    if (!endDate) return;

    const calculateTime = () => {
      const end = new Date(endDate).getTime();
      const now = Date.now();
      const diff = end - now;

      if (isNaN(end) || diff <= 0) {
        if (!hasCalledExpireRef.current && onExpire) {
          hasCalledExpireRef.current = true;
          onExpire();
        }
        return { days: 0, hours: 0, minutes: 0, seconds: 0, isExpired: true };
      }

      const days = Math.floor(diff / (1000 * 60 * 60 * 24));
      const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((diff % (1000 * 60)) / 1000);

      return { days, hours, minutes, seconds, isExpired: false };
    };

    // Initial calculation
    setTimeLeft(calculateTime());

    // Update every 1000ms
    const interval = setInterval(() => {
      const updated = calculateTime();
      setTimeLeft(updated);
    }, 1000);

    return () => clearInterval(interval);
  }, [endDate, onExpire]);

  // Dimensions based on size
  const config = {
    normal: {
      cardWidth: '32px',
      cardHeight: '44px',
      fontSize: '1.35rem',
      labelSize: '0.72rem',
      unitGap: '14px',
      cardGap: '3px'
    },
    compact: {
      cardWidth: '24px',
      cardHeight: '34px',
      fontSize: '1.05rem',
      labelSize: '0.65rem',
      unitGap: '10px',
      cardGap: '2px'
    },
    small: {
      cardWidth: '19px',
      cardHeight: '26px',
      fontSize: '0.85rem',
      labelSize: '0.58rem',
      unitGap: '8px',
      cardGap: '2px'
    }
  }[size] || {
    cardWidth: '32px',
    cardHeight: '44px',
    fontSize: '1.35rem',
    labelSize: '0.72rem',
    unitGap: '14px',
    cardGap: '3px'
  };

  const getDigits = (num, minDigits = 2) => {
    return String(Math.max(0, num)).padStart(minDigits, '0').split('');
  };

  const units = [
    { label: 'Days', digits: getDigits(timeLeft.days) },
    { label: 'Hours', digits: getDigits(timeLeft.hours) },
    { label: 'Minutes', digits: getDigits(timeLeft.minutes) },
    { label: 'Seconds', digits: getDigits(timeLeft.seconds) }
  ];

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      gap: '8px',
      userSelect: 'none'
    }}>
      {showTitle && (
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '6px',
          color: timeLeft.isExpired ? '#C62828' : '#13493C',
          fontSize: size === 'small' ? '0.75rem' : '0.85rem',
          fontWeight: '700',
          letterSpacing: '0.3px',
          marginBottom: '2px'
        }}>
          {timeLeft.isExpired ? (
            <AlertCircle size={size === 'small' ? 14 : 16} color="#C62828" />
          ) : (
            <Clock size={size === 'small' ? 14 : 16} color="#DDA15E" />
          )}
          <span>{timeLeft.isExpired ? 'Rental Period Has Ended (00:00:00:00)' : title}</span>
        </div>
      )}

      {/* Flip-style cards container */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: config.unitGap,
        flexWrap: 'wrap'
      }}>
        {units.map((unit, uIdx) => (
          <div key={unit.label} style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '5px'
          }}>
            {/* Digit Cards Group */}
            <div style={{
              display: 'flex',
              gap: config.cardGap
            }}>
              {unit.digits.map((d, dIdx) => (
                <div
                  key={`${uIdx}-${dIdx}`}
                  style={{
                    width: config.cardWidth,
                    height: config.cardHeight,
                    backgroundColor: timeLeft.isExpired ? '#5A2A27' : '#13493C',
                    backgroundImage: timeLeft.isExpired 
                      ? 'linear-gradient(180deg, #7A3530 0%, #4D211E 100%)' 
                      : 'linear-gradient(180deg, #1C5A4B 0%, #0F3B30 100%)',
                    color: '#FAF9F0',
                    borderRadius: '6px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontWeight: '800',
                    fontSize: config.fontSize,
                    fontFamily: "'Courier New', Courier, monospace",
                    boxShadow: '0 4px 10px rgba(19, 73, 60, 0.25), inset 0 1px 0 rgba(255, 255, 255, 0.15)',
                    border: '1px solid rgba(221, 161, 94, 0.35)',
                    position: 'relative',
                    overflow: 'hidden'
                  }}
                >
                  {/* Flip card horizontal crease/divider line */}
                  <div style={{
                    position: 'absolute',
                    top: '50%',
                    left: 0,
                    right: 0,
                    height: '1px',
                    backgroundColor: 'rgba(0, 0, 0, 0.4)',
                    boxShadow: '0 1px 0 rgba(255, 255, 255, 0.12)',
                    zIndex: 2
                  }} />

                  {/* Digit text */}
                  <span style={{ 
                    position: 'relative', 
                    zIndex: 3, 
                    lineHeight: 1,
                    textShadow: '0 1px 2px rgba(0,0,0,0.4)'
                  }}>
                    {d}
                  </span>
                </div>
              ))}
            </div>

            {/* Unit Label */}
            <span style={{
              fontSize: config.labelSize,
              fontWeight: '700',
              color: timeLeft.isExpired ? '#9C3A35' : '#606C38',
              textTransform: 'uppercase',
              letterSpacing: '0.8px',
              fontFamily: "'Inter', sans-serif"
            }}>
              {unit.label}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default RentalFlipCountdown;
