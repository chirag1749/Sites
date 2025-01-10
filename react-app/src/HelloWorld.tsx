import React, { useEffect, useRef } from "react";

function HelloWorld(){

    const myContainer = useRef(null);

    useEffect(() => {
        console.log("myContainer..", myContainer.current);
      });

    return <h1 ref={myContainer}>Hello World</h1>;
}

export default HelloWorld;