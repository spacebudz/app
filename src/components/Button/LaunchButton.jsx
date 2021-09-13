import React from "react";
import "./LaunchButton.scss";
import charming from "charming";
import Spaceship from "../../images/assets/spaceship.svg";

const LaunchButton = (props) => {
  React.useEffect(() => {
    const d = 40;

    document.querySelectorAll(".rocket-button").forEach((elem) => {
      elem.querySelectorAll(".default, .success > div").forEach((text) => {
        charming(text);
        text.querySelectorAll("span").forEach((span, i) => {
          span.innerHTML =
            span.textContent == " " ? "&nbsp;" : span.textContent;
          //   span.style.setProperty("--d", i * d + "ms");
          //   //   span.style.setProperty(
          //     "--ds",
          //     text.querySelectorAll("span").length * d - d - i * d + "ms"
          //   );
        });
      });

      elem.addEventListener("click", (e) => {
        e.preventDefault();
        if (elem.classList.contains("animated")) {
          return;
        }
        elem.classList.add("animated");
        elem.classList.toggle("live");
        setTimeout(() => {
          elem.classList.remove("animated");
          props.onClick();
        }, 1600);
      });
    });
  }, []);
  return (
    <div>
      {" "}
      <a href="" className="rocket-button" style={{ padding: "24px 30px" }}>
        <div className="default">Explore Collectibles</div>

        <div className="animation">
          <div className="rocket">
            <img width={30} src={Spaceship}></img>
          </div>
          <div className="smoke">
            <i></i>
            <i></i>
            <i></i>
            <i></i>
            <i></i>
            <i></i>
          </div>
        </div>
      </a>
    </div>
  );
};

export default LaunchButton;
