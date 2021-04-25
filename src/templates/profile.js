import React from "react";
import MiddleEllipsis from "react-middle-ellipsis";

import Layout from "../templates/layout";

const Profile = (props) => {
  const {
    match: { params },
  } = props;
  React.useEffect(() => {
    window.scrollTo(0, 0);
  }, []);
  return (
    <Layout>
      <div
        style={{
          minHeight: "100vh",
          margin: "0 20px",
          marginTop: 20,
          display: "flex",
          alignItems: "center",
          flexDirection: "column",
        }}
      >
        <div
          style={{
            maxWidth: 1400,
            width: "100%",
          }}
        >
          <div style={{ fontWeight: 600, fontSize: 26 }}>Account Details</div>
          <div
            style={{
              width: "300px",
              whiteSpace: "nowrap",
            }}
          >
            <MiddleEllipsis>
              <span style={{ fontSize: 12 }}>{params.address}</span>
            </MiddleEllipsis>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Profile;
