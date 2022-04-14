import React, { useEffect, useState } from 'react'


const Heading: React.FC = () => {
  const [width, setWidth] = useState(window.innerWidth);

  useEffect(() => {
    function handleResize() {
      setWidth(window.innerWidth);
    }
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [width]);

  useEffect(() => {
  },[width]);

  return (
        <div>
        <h1 style={{color: 'white', textAlign: 'center'}}>Solana Counter DApp</h1>
        <p style={{color: 'white', textAlign: 'center', padding: '.5em'}}>A simple counter dapp - counter data is stored on the solana blockchain :)</p>
       {width < 481 ? <p style={{color: 'lightGray', textAlign: 'center', padding: '.5em'}}>Recommend to try DApp on desktop browsers 💻</p> : null } 
    </div>
  )
}

export default Heading