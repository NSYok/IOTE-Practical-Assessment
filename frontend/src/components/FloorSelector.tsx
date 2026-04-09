'use client';

interface FloorSelectorProps {
  floors: number[];
  activeFloor: number;
  onChange: (floor: number) => void;
}

export default function FloorSelector({ floors, activeFloor, onChange }: FloorSelectorProps) {
  return (
    <div
      style={{
        display: 'inline-flex',
        gap: 4,
        backgroundColor: '#0f0f0f',
        border: '1px solid #2e2e2e',
        borderRadius: 9999,
        padding: '4px',
      }}
    >
      {floors.map((floor) => {
        const isActive = floor === activeFloor;
        return (
          <button
            key={floor}
            onClick={() => onChange(floor)}
            style={{
              padding: '6px 20px',
              borderRadius: 9999,
              border: 'none',
              cursor: 'pointer',
              fontSize: 13,
              fontWeight: 500,
              fontFamily: 'Inter, sans-serif',
              transition: 'all 0.15s ease',
              backgroundColor: isActive ? '#171717' : 'transparent',
              color: isActive ? '#fafafa' : '#898989',
              outline: isActive ? '1px solid #363636' : 'none',
            }}
          >
            Floor {floor}
          </button>
        );
      })}
    </div>
  );
}
