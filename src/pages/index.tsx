import * as React from "react";
import { MainLayout } from "../layouts/mainLayout";
import { Button } from "../components";
import { graphql, Link, useStaticQuery } from "gatsby";
import BackgroundImage from "gatsby-background-image";
import { ArrowRightShort } from "@styled-icons/bootstrap/ArrowRightShort";
import Asteroid from "../images/asteroid.svg";
import { useBreakpoint } from "gatsby-plugin-breakpoints";

// import {}

const Index = () => {
  const breakpoints = useBreakpoint();

  const {
    allFile: { nodes: parallaxImages },
  } = useStaticQuery(graphql`
    query {
      allFile(
        filter: { relativeDirectory: { eq: "parallax" } }
        sort: { fields: [base] }
      ) {
        nodes {
          childImageSharp {
            fluid(quality: 100, maxWidth: 10000) {
              ...GatsbyImageSharpFluid_withWebp
            }
          }
        }
      }
    }
  `);

  const [scrollTop, setScrollTop] = React.useState(0);

  const scrollLoop = () => {
    setScrollTop(window.scrollY);

    return requestAnimationFrame(scrollLoop);
  };

  const asteroidRef = React.useRef<HTMLImageElement>();
  const [asteroidHeight, setAsteroidHeight] = React.useState(0);

  React.useEffect(() => {
    const asteroidInterval = setInterval(() => {
      if (asteroidRef.current?.offsetHeight !== asteroidHeight) {
        setAsteroidHeight(asteroidRef.current?.offsetHeight - 2);
      }
    });
    return () => {
      clearInterval(asteroidInterval);
    };
  }, []);

  React.useEffect(() => {
    const animation = scrollLoop();

    return () => {
      cancelAnimationFrame(animation);
    };
  }, []);

  return (
    <MainLayout landing>
      <>
        <div className="w-full h-screen overflow-y-visible bg-slate-900">
          <div className="md:left-0 md:fixed w-full h-screen">
            <BackgroundImage
              className="w-full h-full relative bg-cover bg-no-repeat bg-left-bottom"
              fluid={parallaxImages[1].childImageSharp.fluid}
              style={{
                top: breakpoints.sm ? "" : -Math.floor(scrollTop * 0.4),
              }}
            >
              <BackgroundImage
                className="w-full h-full relative bg-cover bg-no-repeat bg-left-bottom"
                fluid={parallaxImages[2].childImageSharp.fluid}
                style={{
                  top: breakpoints.sm ? "" : -Math.floor(scrollTop * 0.1),
                }}
              >
                <BackgroundImage
                  className="w-full h-full relative bg-cover bg-no-repeat bg-left-bottom"
                  fluid={parallaxImages[0].childImageSharp.fluid}
                  style={{
                    top: breakpoints.sm ? "" : -Math.floor(scrollTop * 0.4),
                  }}
                />
              </BackgroundImage>
              <div className="absolute left-[5%] right-[5%] md:rigth-auto md:left-[10%] top-[40%] md:top-[34%] lg:bottom-[22%] lg:top-auto max-w-md lg:max-w-md">
                <div className="bg-slate-800 border-2 border-b-4 border-slate-900 p-7 rounded-xl">
                  <div className="font-title text-3xl text-white font-bold">
                    <span className="">Welcome</span> to{" "}
                    <span className="text-primary">SpaceBudz</span>
                  </div>
                  <div className="ml-2 mt-2 font-title text-md md:text-lg text-white font-semibold max-w-sm">
                    Let's go on an adventure, where will your SpaceBudz take
                    you?
                  </div>
                </div>
                <Link className="mt-6 block w-fit" to="/explore/">
                  <Button
                    rightEl={
                      <ArrowRightShort
                        size={24}
                        className="stroke-white stroke-1"
                      />
                    }
                    theme="space"
                  >
                    Explore
                  </Button>
                </Link>
              </div>
            </BackgroundImage>
          </div>
        </div>
        <div className="relative w-full min-h-screen md:h-screen bg-slate-900 -mt-16">
          <img
            className="absolute pointer-events-none"
            style={{ top: -asteroidHeight }}
            src={Asteroid}
            ref={asteroidRef}
          />
          <div className="w-full h-full flex justify-center items-center">
            <div className="w-full px-8 max-w-2xl text-justify my-80">
              As a line of code revealed the yet unknown, something peculiar was
              about to happen in selected places on planet earth. Seemingly out
              of nowhere, the chosen ones would come together and embark on the
              biggest adventure of their lifetimes. SpaceBudz would soon find
              out, but right now, they were still unaware, completely oblivious
              to their destiny.
            </div>
          </div>
        </div>
      </>
    </MainLayout>
  );
};

export default Index;
