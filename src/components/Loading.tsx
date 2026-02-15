import { Oval } from "react-loader-spinner";

const Loading = () => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-white">
      <Oval
        height={120}
        width={120}
        color="#327fcd"
        secondaryColor="#32cd32"
        strokeWidth={4}
        ariaLabel="loading"
      />
    </div>
  );
};

export default Loading;
