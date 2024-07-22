import { useEffect } from 'react'

const Reciever = () => {
    useEffect(() => {
      const socket = new WebSocket("ws://localhost:8080");
      socket.onopen = () => {
        socket.send(JSON.stringify({ type: 'receiver' }));
      }

      socket.onmessage = async(event) => {
        const message = JSON.parse(event.data)

        if (message.type === 'createOffer') {
          const pc = new RTCPeerConnection();
          pc.setRemoteDescription(message.sdp);
          const answer = await pc.createAnswer();
          await pc.setLocalDescription(answer);
          // console.log("Sending answer back to sender");
          socket.send(
            JSON.stringify({ type: 'createAnswer', sdp: pc.localDescription })
          );
        }
       
      }      

    }, []);
    
    return (    
    <div>
      reciever
    </div>
  )
}

export default Reciever
