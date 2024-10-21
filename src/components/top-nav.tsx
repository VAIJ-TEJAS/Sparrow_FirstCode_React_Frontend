import { useContext } from "react";
// import { useStore } from "../store";
import { SelectedFileContext } from "../store/context/SelectedFileContext";
import { Button } from "./ui/button";
import { Download, UploadCloud, Play } from "lucide-react";
// import Settings from "./settings";
import { JSONContext } from "../store/context/JSONContext";

interface TopNavProps {
  handleRunCode: () => Promise<void>;
  handleSaveCode: () => Promise<void>;
  handleFileUpload: () => Promise<void>;
}

export default function TopNav({
  handleRunCode,
  handleSaveCode,
  handleFileUpload,
}: TopNavProps) {
  // const { code } = useStore();
  const selectedfilecontext = useContext(SelectedFileContext);
  const jsoncontext = useContext(JSONContext);
  if (!selectedfilecontext || !jsoncontext) {
    throw new Error("ReadmeContext not found");
  }
  const { state: SelectedFileState } = selectedfilecontext;
  const { state: JSONState } = jsoncontext;

  // function handleChangeDirection() {
  //   setDirection(direction === "vertical" ? "horizontal" : "vertical");
  // }

  // function handleCodeDelete() {
  //   setCode("");
  //   clearOutput("Running Python 3.12.1");
  // }

  // function handleDownloadCode() {
  //   const blob = new Blob([code], { type: "text/plain" });
  //   const url = URL.createObjectURL(blob);
  //   const link = document.createElement("a");
  //   link.download = "code.py";
  //   link.href = url;
  //   document.body.appendChild(link);
  //   link.click();
  //   document.body.removeChild(link);
  // }

  return (
    <div className="" style={{ marginRight: "5px" }}>
      <Button
        style={{ backgroundColor: "#4caa9d" }}
        onClick={handleRunCode}
        variant="secondary"
      >
        <Play style={{ color: "white" }} className="h-5 w-10" />
      </Button>
    </div>
  );
}
