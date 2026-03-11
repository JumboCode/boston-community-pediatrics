"use client";

interface SkeletonProps {
  className?: string;
}

function Skeleton(props: SkeletonProps){
    const { className } = props;
    return(
        <div className = {`animate-pulse bg-gray-200 ${className}`}/>
    );
}

export default Skeleton;