import { useEffect } from "react";

const Reciever = () => {
  useEffect(() => {
    const socket = new WebSocket("ws://localhost:8080");
    socket.onopen = () => {
      socket.send(JSON.stringify({ type: "receiver" }));
    };

    socket.onmessage = async (event) => {
      const message = JSON.parse(event.data);
      let pc: RTCPeerConnection | null = null;
      if (message.type === "createOffer") {
        pc = new RTCPeerConnection();
        pc.setRemoteDescription(message.sdp);

        pc.onicecandidate = (event) => {
          if (event.candidate) {
            socket?.send(
              JSON.stringify({
                type: "iceCandidate",
                candidate: event.candidate,
              })
            );
          }
        };

        pc.ontrack = (track) => {
          console.log(track);
        };
        const answer = await pc.createAnswer();
        await pc.setLocalDescription(answer);
        // console.log("Sending answer back to sender");
        socket.send(
          JSON.stringify({ type: "createAnswer", sdp: pc.localDescription })
        );
      } else if (message.type === "iceCandidate") {
        if (pc !== null) {
          // pc.addIceCandidate(message.candidate);
        }
      }
    };
  }, []);

  return <div>reciever</div>;
};

export default Reciever;
