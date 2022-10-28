import {useEffect, useState} from "react";
import Image from "next/image";

export default function ImageWithFallback({src, placeholderSrc, errorSrc, alt, ...props}) {
    const [imageSrc, setImageSrc] = useState(src || '');

    useEffect(() => {
        setImageSrc(src);
    }, [src]);

    return (
        <Image
            {...props}
            src={imageSrc}
            onError={() => setImageSrc(errorSrc)}
            alt={alt}
            placeholder="blur"
            blurDataURL={placeholderSrc}
        />
    );
}
