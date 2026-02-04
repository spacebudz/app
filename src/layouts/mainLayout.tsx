import * as React from "react";
import { Toaster } from "react-hot-toast";
import { Header, Footer } from "../components";
import { Helmet } from "react-helmet";
import { RehydrationContext } from "./storeProvider";

type MainLayoutProps = {
  landing?: boolean; // different behaviour on landing page
  children?: JSX.Element | string;
  // metadata
  title?: string;
  titleTwitter?: string;
  description?: string;
  image?: string;
};

export const MainLayout = (props: MainLayoutProps) => {
  const isRehydrated = React.useContext(RehydrationContext);
  return (
    <>
      <Helmet>
        <title>{props.title}</title>
      </Helmet>
      {isRehydrated ? (
        <div className="w-full">
          <div
            className={`${
              props.landing ? "text-white" : "text-black"
            } min-h-screen w-full h-full flex flex-col`}
          >
            <a
              href="https://github.com/spacebudz/nebula"
              className="w-full h-20 bg-primary flex justify-center items-center cursor-pointer border-b-2 border-violet-600 z-10 text-white"
            >
              <div className="text-center">
                <b>
                  The Nebula marketplace interface is being sunset, please
<<<<<<< HEAD
                  delist and cancel your bids. Smart contract is open-source and
                  available here:{" "}
                  <a href="https://github.com/spacebudz/nebula">
                    https://github.com/spacebudz/nebula
                  </a>
                  <br />
                  Use this interface at your own risk. It comes without support,
                  updates, or ongoing maintenance. Make sure to verify the
                  contract and policy id yourself.
=======
                  delist and cancel your bids. (Canceled listings/bids may still
                  appear, simply ignore)
>>>>>>> c67d1ff (cleanup)
                </b>
              </div>
            </a>

            <div className="relative">
              <Header landing={props.landing} />
            </div>
            <div className={`${props.landing ? "h-0" : "h-24 md:h-32"}`} />
            {props.children}
          </div>
          <Footer />
          <Toaster position="bottom-right" />
        </div>
      ) : null}
    </>
  );
};

MainLayout.defaultProps = {
  title: "SpaceBudz",
  titleTwitter: "SpaceBudz",
  description: "Let's go on an adventure, where will your SpaceBudz take you?",
};
