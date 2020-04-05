import { ReactNode } from 'react';

interface CardProps {
  color?: 'red' | 'gray';
  children: ReactNode;
}

export default function Card({ children, color = 'gray' }: CardProps) {
  return (
    <>
      <div className={`card ${color}`}>{children}</div>
      <style jsx global>{`
        .card {
          padding: 20px;
          border-radius: 5px;
          display: flex;
          flex-direction: column;
        }

        .red {
          background-color: #ffcdcc;
          color: #ff4945;
        }

        .gray {
          background-color: #e6e6e6;
          color: #898989;
        }
      `}</style>
    </>
  );
}
