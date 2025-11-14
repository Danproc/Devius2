import React from 'react';

interface Props {
  title: string;
}

const MagicBadge = ({ title }: Props) => {
  return (
    <div className="relative inline-flex h-8 overflow-hidden rounded-full p-[1.5px] focus:outline-none select-none">
      <span className="absolute inset-[-1000%] animate-[spin_3s_linear_infinite] bg-[conic-gradient(from_90deg_at_50%_50%,#1cf491_0%,#0a7a4a_50%,#1cf491_100%)]" />
      <span className="inline-flex h-full w-full cursor-pointer items-center justify-center rounded-full bg-devcard-base px-4 py-1 text-sm font-medium text-devcard-heading backdrop-blur-3xl">
        {title}
      </span>
    </div>
  );
};

export default MagicBadge;
