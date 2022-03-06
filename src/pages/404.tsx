import * as React from "react";
import { MainLayout } from "../layouts/mainLayout";

const Page404 = () => (
  <div className="bg-slate-900">
    <MainLayout landing>
      <div className="w-full h-screen flex justify-center items-center flex-col">
        <div className="text-8xl font-title mb-4">404</div>
        <div className="max-w-[90%]">
          {" "}
          You are at the end of the galaxy, there is nothing here...
        </div>
      </div>
    </MainLayout>
  </div>
);

export default Page404;
