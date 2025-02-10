import { useEffect, useState } from "react";

import copyIcon from "../assets/copyIcon.svg";
import { usePlayground } from "../services/playground";
import Button from "./Button";
import Card from "./Card";
import Divider from "./Divider";

function Account() {
  const [addressToShow, setAddressToShow] = useState<string>("");
  const { address, userInfo, getUserInfo, getExternalIdToken } = usePlayground();

  useEffect(() => {
    setAddressToShow(address || "");
  }, [address]);

  return (
    <Card className="text-center">
      <div className="mb-2">
        {userInfo?.profileImage && <img className="object-fill mx-auto w-16 h-16 rounded-full" src={userInfo?.profileImage} alt="" />}
        {!userInfo?.profileImage && userInfo?.name && (
          <span className="flex mx-auto justify-center items-center bg-purple-100 font-semibold w-16 h-16 rounded-full text-[36px] text-purple-800">
            {userInfo?.name.charAt(0).toUpperCase()}
          </span>
        )}
      </div>
      <div>
        <h3 className="font-bold text-app-gray-800 mb-2">{userInfo?.name || ""}</h3>
        <p className="text-xs text-app-gray-400 mb-1">{userInfo?.email ? userInfo?.email : userInfo?.name}</p>
        <p><button type="button" className="leading-none text-xs text-app-primary-600 hover:underline" onClick={getUserInfo}>
          View User Info
        </button></p>
        <p><button type="button" className="leading-none text-xs text-app-primary-600 hover:underline" onClick={getExternalIdToken}>
          Get External Id Token
        </button></p>
      </div>
      <Divider />
      <Button
        className="text-sm w-full"
        title="Copy"
        onClick={() => {
          navigator.clipboard.writeText(address);
          setAddressToShow("Copied!");
          setTimeout(() => {
            setAddressToShow(address);
          }, 1000);
        }}
      >
        <span className="overflow-hidden overflow-ellipsis">{addressToShow}</span>
        <div className="ml-2 flex-shrink-0">
          <img src={copyIcon} className="w-3 h-3" alt="" />
        </div>
      </Button>
    </Card>
  );
}
export default Account;
