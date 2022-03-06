import * as React from "react";
import { MainLayout } from "../layouts/mainLayout";

const PrivacyPolicy = () => {
  return (
    <MainLayout
      title="SpaceBudz | Privacy policy"
      titleTwitter="SpaceBudz: Privacy policy"
    >
      <div className="w-full flex justify-center items-center mb-40">
        <div className="px-4 mt-4 md:mt-0 max-w-5xl w-full">
          <div className="font-bold text-primary text-3xl mb-16">
            Privacy policy
          </div>
          <div>
            <div className="mb-2 text-lg font-bold">Liability for Contents</div>
            <p>
              The contents of our pages were created with the utmost care. For
              the correctness, completeness and timeliness of the content, we
              can not guarantee. As a service provider, we are responsible for
              our own content on these pages under the general laws according to
              § 7 para.1 TMG. According to §§ 8 to 10 TMG, we are not obligated
              as a service provider to monitor transmitted or stored foreign
              information or to investigate circumstances that indicate illegal
              activity. Obligations to remove or block the use of information
              according to the general laws remain unaffected. However,
              liability in this regard is only possible from the point in time
              at which a concrete infringement of the law becomes known. If we
              become aware of corresponding infringements, we will remove this
              content immediately.
            </p>
            <div className="mb-2 mt-4 text-lg font-bold">
              Attitude for Links
            </div>
            <p>
              Our offer contains links to external websites of third parties, on
              whose contents we have no influence. Therefore, we cannot assume
              any liability for these external contents. The respective provider
              or operator of the pages is always responsible for the content of
              the linked pages. The linked pages were checked for possible legal
              violations at the time of linking. Illegal contents were not
              recognizable at the time of linking. However, a permanent control
              of the contents of the linked pages is not reasonable without
              concrete evidence of a violation of the law. If we become aware of
              any infringements, we will remove such links immediately.
            </p>
            <div className="mb-2 mt-4 text-lg font-bold">Data Protection</div>
            <p>
              The use of our website is generally possible without providing
              personal data. As far as on our sides personal data (such as name,
              address or e-mail addresses) are collected, this is as far as
              possible on a voluntary basis. This data will not be passed on to
              third parties without your express consent. We point out that data
              transmission over the Internet (eg communication by e-mail)
              security gaps. Complete protection of data against access by third
              parties is not possible. The use of contact data published within
              the framework of the imprint obligation by third parties for the
              purpose of sending unsolicited advertising and information
              materials is hereby expressly prohibited. The operators of the
              pages expressly reserve the right to take legal action in the
              event of the unsolicited sending of advertising information, such
              as spam mails.
            </p>
            <div className="mb-2 mt-4 text-lg font-bold">
              Firebase from Google
            </div>
            <p>
              We use the Firebase service of Google LLC. (1600 Amphitheatre
              Parkway, Mountain View, CA 94043, USA). Firebase is part of the
              Google Cloud Platform and offers numerous services for developers.
              A list can be found here: https://firebase.google.com/terms/. Some
              Firebase services process personal data. We currently use the
              following Firebase services: Firebase Hosting: hosting uses IP
              addresses of incoming requests to detect abuse and provide
              customers with detailed analysis of usage data. Hosting keeps IP
              data for several months.
            </p>
          </div>
        </div>
      </div>
    </MainLayout>
  );
};

export default PrivacyPolicy;
