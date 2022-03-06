import * as React from "react";
import { MainLayout } from "../layouts/mainLayout";
import { Button } from "../components";
import { graphql, Link, useStaticQuery } from "gatsby";
import BackgroundImage from "gatsby-background-image";
import { ArrowRightShort } from "@styled-icons/bootstrap/ArrowRightShort";

const Index = () => {
  const {
    file: {
      childImageSharp: { fluid: backgroundImage },
    },
  } = useStaticQuery(graphql`
    query {
      file(relativePath: { eq: "background.jpg" }) {
        childImageSharp {
          fluid(quality: 100, maxWidth: 10000) {
            ...GatsbyImageSharpFluid_withWebp
          }
        }
      }
    }
  `);

  return (
    <MainLayout landing>
      <>
        <BackgroundImage
          className="w-full h-screen relative bg-cover bg-no-repeat bg-left-bottom overflow-y-visible"
          fluid={backgroundImage}
        >
          <div className="absolute left-[5%] md:left-auto md:right-[10%] top-[24%] md:top-[28%] lg:bottom-[20%] lg:top-auto max-w-[92%] lg:max-w-md">
            <div className="font-title text-3xl md:text-4xl text-white font-bold">
              <span className="">Welcome</span> to{" "}
              <span className="text-primary">SpaceBudz</span>
            </div>
            <div className="ml-2 mt-2 font-title text-md md:text-lg text-white font-semibold max-w-sm">
              Let's go on an adventure, where will your SpaceBudz take you?
            </div>
            <Link className="mt-6 hidden lg:block" to="/explore/">
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
          <Link
            className="mt-6 absolute right-10 bottom-10 lg:hidden"
            to="/explore/"
          >
            <Button
              rightEl={
                <ArrowRightShort size={24} className="stroke-white stroke-1" />
              }
              theme="space"
            >
              Explore
            </Button>
          </Link>
        </BackgroundImage>
        <div className="relative w-full min-h-screen md:h-screen bg-slate-900">
          <div className="absolute -top-6 left-0 w-full h-28 flex justify-center">
            <div className="-ml-10 w-[120%] landing-gradient blur-md"></div>
          </div>
          <div className="w-full h-full flex justify-center items-center">
            <div className="w-full px-6 max-w-2xl text-justify my-80">
              As a line of code revealed the yet unknown, something peculiar was
              about to happen in selected places on planet earth. Seemingly out
              of nowhere, the chosen ones would come together and embark on the
              biggest adventure of their lifetimes. Spacebudz holders would soon
              find out, but right now, they were still unaware, completely
              oblivious to their destiny.
            </div>
          </div>
        </div>
      </>
    </MainLayout>
  );
};

export default Index;
