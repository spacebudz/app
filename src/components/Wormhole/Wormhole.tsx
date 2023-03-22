import { graphql, useStaticQuery } from "gatsby";
import * as React from "react";
import { ipfsToHttps } from "../../utils";
import { Button } from "../Button";

type WormholeProps = {
  ids: number[];
  hasStarted: boolean;
  setHasStarted: (state: boolean) => unknown;
};

export const Wormhole = ({ ids, hasStarted, setHasStarted }: WormholeProps) => {
  const data = useStaticQuery(graphql`
    query {
      allMetadataJson {
        edges {
          node {
            budId
            name
            image
          }
        }
      }
    }
  `);

  const [hasEnded, setHasEnded] = React.useState(false);
  const [isMuted, setIsMuted] = React.useState(false);

  const init = async () => {
    window.history.pushState(null, "", window.location.href);
    window.onpopstate = function () {
      window.history.pushState(null, "", window.location.href);
    };
    document.body.style.overflow = "hidden";
    const video = document.getElementById("wormhole") as HTMLVideoElement;
    const promise = video.play();

    if (promise !== undefined) {
      promise
        .then((_) => {
          console.log("Entering wormhole...");
        })
        .catch((error) => {
          setIsMuted(true);
          video.play();
        });
    }

    const imageLinks = ids.map((id) =>
      ipfsToHttps(
        data.allMetadataJson.edges.find((node: any) => node.node.budId === id)
          .node.image
      )
    );

    const animateBud = createBud(imageLinks);
    await new Promise((res) =>
      setInterval(() => video.currentTime >= 25.24 && res(1))
    );
    setHasEnded(true);

    animateBud();
    for (let i = 0; i < 150; i++) {
      createParticle(0, 0);
    }

    await new Promise((res) => setTimeout(() => res(1), 1500));
    animateWelcome();
    await new Promise((res) => setTimeout(() => res(1), 600));
    animateExit();
  };

  React.useEffect(() => {
    if (hasStarted) {
      init();
    }
  }, [hasStarted]);

  const [videoSrc, setVideoSrc] = React.useState("");
  React.useEffect(() => {
    // Preload wormhole animation
    (async () => {
      const arrayBuffer = await fetch("/wormhole.mp4").then((res) =>
        res.arrayBuffer()
      );
      setVideoSrc(
        URL.createObjectURL(new Blob([arrayBuffer], { type: "video/mp4" }))
      );
    })();
  }, []);

  return hasStarted ? (
    <>
      <video
        id="wormhole"
        onEnded={() => setHasEnded(true)}
        className={`fixed top-0 left-0 right-0 bottom-0 w-screen h-screen object-cover z-[100000]`}
        src={videoSrc}
        playsInline
        muted={isMuted}
      ></video>
      <div
        onClick={() => {
          setIsMuted(false);
        }}
        className={`fixed top-0 left-0 right-0 bottom-0 w-screen h-screen bg-white z-[100001] ${
          hasEnded ? "opacity-100" : "opacity-0"
        }`}
      >
        <div
          id="revelation-screen"
          className="absolute mx-auto my-auto left-0 right-0 top-0 bottom-0 text-center w-0 h-0"
        ></div>
        <div
          id="revelation-budz"
          className="absolute mx-auto my-auto left-0 right-0 top-0 bottom-0 will-change-transform"
        ></div>
        <div
          id="revelation-text"
          className="opacity-0 absolute mx-auto my-auto left-0 right-0 top-0 bottom-0 w-[350px] h-[400px] max-w-[90%] flex justify-center items-center"
        >
          <div className="text-center mt-[320px] md:mt-[450px]">
            <div className="text-2xl md:text-3xl font-bold font-title mb-4">
              Back from beyond, how was the journey?
            </div>
            <div className="text-base md:text-lg">
              {ids.length > 1
                ? `SpaceBud #${ids[0]} and ${ids.length - 1} other Budz traveled
                safely through the wormhole.`
                : `SpaceBud #${ids[0]} traveled safely through the wormhole.`}
            </div>
          </div>
        </div>
        <Button
          id="revelation-exit"
          className="absolute top-6 right-6 opacity-0"
          size="lg"
          theme="rose"
          onClick={() => {
            document.body.style.overflow = "auto";
            window.onpopstate = () => {};
            window.history.back();
            setHasStarted(false);
            setHasEnded(false);
          }}
        >
          Exit
        </Button>
      </div>
    </>
  ) : (
    <></>
  );
};

function animateWelcome() {
  const imgs = document.getElementById("revelation-budz") as HTMLDivElement;
  const message = document.getElementById("revelation-text") as HTMLDivElement;
  imgs.animate([{ transform: "translateY(-100px)" }], {
    duration: 400,
    easing: "ease-out",
    fill: "forwards",
  });
  message.animate([{ opacity: 1 }], {
    duration: 300,
    easing: "ease-out",
    fill: "forwards",
  });
}

function animateExit() {
  const exit = document.getElementById("revelation-exit") as HTMLButtonElement;
  exit.animate([{ opacity: 1 }], {
    duration: 300,
    easing: "ease-out",
    fill: "forwards",
  });
}

function createBud(imageLinks: string[]) {
  const imgs = imageLinks
    .slice()
    .reverse()
    .map((imageLink) => {
      const img = document.createElement("img");
      img.classList.add(
        ..."max-w-[95%] w-[500px] aspect-square absolute mx-auto my-auto left-0 right-0 top-0 bottom-0 opacity-0".split(
          " "
        )
      );
      img.src = imageLink;

      document.getElementById("revelation-budz").appendChild(img);
      return img;
    });

  return () =>
    imgs.map((img, i) => {
      if (i === imgs.length - 1) {
        setTimeout(() => {
          for (let p = 0; p < 40; p++) {
            createParticle(0, 0);
          }
          img.animate(
            [
              {
                opacity: 1,
                transform: "scale(0.6)",
              },
              {
                opacity: 1,
                transform: "scale(1.03)",
              },
              {
                opacity: 1,
                transform: "scale(1)",
              },
            ],
            { duration: 160, easing: "linear", fill: "forwards" }
          );
        }, i * 110);
      } else {
        setTimeout(() => {
          for (let p = 0; p < 40; p++) {
            createParticle(0, 0);
          }
          img.animate(
            [
              {
                opacity: 1,
                transform: "scale(0.6)",
              },
              {
                opacity: 1,
                transform: "scale(1.03)",
              },
              {
                opacity: 1,
                transform: "scale(1)",
              },
            ],
            { duration: 160, easing: "linear" }
          );
        }, i * 110);
      }
    });
}

function createParticle(x: number, y: number) {
  const particle = document.createElement("div");
  const el = document.getElementById("revelation-screen");
  el.appendChild(particle);

  particle.style.position = "absolute";
  particle.style.left = "0";
  particle.style.top = "0";
  particle.style.pointerEvents = "none";

  particle.style.rotate = Math.random() * 180 + "deg";
  particle.style.clipPath =
    "polygon(50% 0%, 100% 60%, 80% 100%, 20% 100%, 0% 40%)";

  const size = Math.floor(Math.random() * 55);
  particle.style.width = `${size}px`;
  particle.style.height = `${size}px`;
  particle.style.background = "#5342b7";
  const destinationX =
    x + (Math.random() - 0.5) * 2 * Math.max(window.innerWidth, 1000);
  const destinationY =
    y + (Math.random() - 0.5) * 2 * Math.max(window.innerHeight, 1000);

  const animation = particle.animate(
    [
      {
        transform: `translate(${x - size / 2}px, ${y - size / 2}px)`,
        opacity: 1,
      },
      {
        transform: `translate(${destinationX}px, ${destinationY}px)`,
        opacity: 0,
      },
    ],
    {
      duration: 500 + Math.random() * 20000,
      easing: "cubic-bezier(0, .9, .57, 1)",
      delay: Math.random(),
    }
  );
  animation.onfinish = () => {
    particle.remove();
  };
}
