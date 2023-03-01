import * as React from "react";
import { MainLayout } from "../layouts/mainLayout";
import PartialWormhole from "../images/wormhole.svg";

const Wormhole = () => (
  <div className="bg-slate-900 overflow-hidden">
    <MainLayout landing>
      <div className="flex items-center flex-col my-40">
        <div className="relative w-[300px] h-[300px] select-none hover:animate-pulse">
          <div className="animate-[spin_28s_linear_infinite] absolute inset-0 flex justify-center items-center">
            <img src={PartialWormhole} className="w-full h-full" />
          </div>
          <div className="animate-[spin_12s_linear_infinite] absolute inset-0 flex justify-center items-center">
            <img src={PartialWormhole} className="rotate-45 w-[80%] h-[80%]" />
          </div>
          <div className="animate-[spin_17s_linear_infinite] absolute inset-0 flex justify-center items-center">
            <img src={PartialWormhole} className="rotate-12 w-[65%] h-[65%]" />
          </div>
          <div className="animate-[spin_22s_linear_infinite] absolute inset-0 flex justify-center items-center">
            <img src={PartialWormhole} className="rotate-45 w-[50%] h-[50%]" />
          </div>
          <div className="animate-[spin_10s_linear_infinite] absolute inset-0 flex justify-center items-center">
            <img src={PartialWormhole} className="w-[40%] h-[40%]" />
          </div>
          <div className="animate-[spin_26s_linear_infinite] absolute inset-0 flex justify-center items-center">
            <img src={PartialWormhole} className="rotate-12 w-[30%] h-[30%]" />
          </div>
        </div>
        <div className="mt-12 text-justify flex justify-center items-center w-full px-8 max-w-2xl">
          One day, while SpaceBudz were exploring the vast reaches of space,
          they stumbled upon a wormhole. Without hesitation, they decided to fly
          through it, eager to see what lay on the other side. As they entered
          the wormhole, they felt a strange sensation wash over them. It was as
          if time and space were warping around them. They held on tight as they
          were swept up in the whirlwind of energy that surrounded them. <br />
          When they emerged on the other side, they were in for a shock. They
          found themselves in a completely different galaxy, surrounded by
          strange and wondrous sights. But something was different about them,
          too. They looked down at themselves and saw that their bodies had been
          transformed. They were excited to explore this new galaxy, and the new
          possibilities that their transformations had opened up for them.
        </div>
      </div>
    </MainLayout>
  </div>
);

export default Wormhole;
