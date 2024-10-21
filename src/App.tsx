import { useStore } from "./store";
import { usePyodide } from "./hooks/pyodide";
import TopNav from "./components/top-nav";
import Terminal from "./components/terminal";
import { FaRegFolderOpen } from "react-icons/fa";
import { MinusIcon, PlusIcon, SquareIcon, XIcon } from "lucide-react";
import { FaTimes } from "react-icons/fa";
import { useContext, useEffect, useState } from "react";
import { ReadmeContext } from "./store/context/ReadmeContext";
import { DataContext } from "./store/context/DataContext";
import { MainContext } from "./store/context/MainContext";
import { ModuleContext } from "./store/context/ModuleContext";
import { SelectedFileContext } from "./store/context/SelectedFileContext";
import MirrorEditor from "./components/codeMirror";
import PipInstall from "./components/pipInstall";
import { JSONContext } from "./store/context/JSONContext";
import { Button } from "./components/ui/button";
import { ThemeContext } from "./store/context/ThemeContext";
import ClipLoader from 'react-spinners/ClipLoader';
import { LanguageName } from "@uiw/codemirror-extensions-langs";
import { EditorTheme } from "./lib/editor-theme";
import { themes } from "./themeData/themes";
import createTheme from "@uiw/codemirror-themes";
import { darkTheme } from "./components/ui/themes";
import Stats from "./components/stats";
import { getIconUrl } from "./icons";
import { useParams } from "react-router-dom";

// Modal component for creating a new file
const CreateFileModal = ({ isOpen, onClose, onCreate }) => {
  const [filename, setFilename] = useState("");

  const handleCreate = () => {
    onCreate(filename);
    setFilename("");
    onClose();
  };

  return (
    isOpen && (
      <div className="fixed inset-0 flex items-center justify-center z-50 text-gray-900">
        <div className="absolute inset-0 bg-black opacity-50"></div>
        <div className="bg-white p-4 rounded z-10">
          <h2 className="text-lg font-bold mb-4 ">Create New File</h2>
          <input
            type="text"
            value={filename}
            onChange={(e) => setFilename(e.target.value)}
            placeholder="Enter filename"
            className="border p-2 mb-4 w-full"
          />
          <div className="flex justify-end">
            <button className="mr-2" onClick={onClose}>
              Cancel
            </button>
            <button onClick={handleCreate}>Create</button>
          </div>
        </div>
      </div>
    )
  );
};

function App() {

  const { "*": lessonFilePath } = useParams();

  const { pyodide, loading, handleRunCode, handleSaveCode } = usePyodide();
  const { code, setCode } = useStore();
  const readmecontext = useContext(ReadmeContext);
  const datacontext = useContext(DataContext);
  const maincontext = useContext(MainContext);
  const modulecontext = useContext(ModuleContext);
  const selectedfilecontext = useContext(SelectedFileContext);
  const jsoncontext = useContext(JSONContext)
  const themecontext = useContext(ThemeContext)
  const [editorTheme, setEditorTheme] = useState<any>(undefined);
  const [fileList, setFileList] = useState<string[]>([]);
  const [isModalOpen, setModalOpen] = useState(false);

  const handleNewFileCreate = (filename) => {
    if (filename && !fileList.includes(filename)) {
      setFileList([...fileList, filename]);
      handleSaveCode(filename, ""); // Save an empty file in Pyodide FS
    }
  };

  if (!readmecontext || !datacontext || !maincontext || !modulecontext || !selectedfilecontext || !jsoncontext || !themecontext) {
    throw new Error('Context not found');
  }

  const { state: MainState, setMain } = maincontext;
  const { state: ModuleState, setModule } = modulecontext;
  const { state: SelectedFileState, setSelectedFile } = selectedfilecontext;
  const { state: JSONState, setJSON } = jsoncontext;
  const { state: ThemeState, setTheme } = themecontext

  useEffect(() => {

    const fetchData = async () => {
      try {
        const lessonPath = `/${lessonFilePath}.json`;
        console.log(lessonPath)
        const response = await fetch(lessonPath);

        console.log(response)

        if (!response.ok) {
          throw new Error('Network response was not ok');
        }
        const data = await response.json();

        setJSON(data);

        const dirLoad = data.appname.dir_load;

        const fileNames = data.appname.files

        setFileList([...fileNames]);

        for (const fileName of fileNames) {
          try {
            const fileResponse = await fetch(`${dirLoad}/${fileName}`);
            const text = await fileResponse.text();
            handleSaveCode(fileName, text);
          } catch (error) {
            console.error(`Error fetching ${fileName}:`, error);
          }
        }
        
        try {
          const content = pyodide.FS.readFile(fileNames[0], { encoding: "utf8" });
          setCode(content);
        } catch (error) {
          console.error(`Error reading ${fileNames[0]} from Pyodide FS:`, error);
        }
        setSelectedFile(fileNames[0])

        const temp = findObjectByName(themes, data.appname.editor_theme);
        if (temp) {
          const options = temp?.options
            const createdTheme = createTheme({
              ...options,
              settings: {
                ...options.settings,
              },
            });
            setEditorTheme(createdTheme);
          
         
          setTheme({
            background: temp?.options.settings.background,
            foreground: temp?.options.settings.caret ? temp?.options.settings.caret : temp?.options.settings.foreground,
            border: temp?.options.settings.selection
          });
        } else {
          setEditorTheme(darkTheme)
          setTheme({
            background: "#282C34",
            foreground: "#BEBEBE",
            border: '#333333'
          });
        }
      } catch (error) {
        console.error('Error fetching the JSON file:', error);
      }
    };

    if(!loading){
      fetchData();
    }
  }, [loading]);

  function findObjectByName(mainObject: Record<string, EditorTheme>, targetName: string) {
    for (const key in mainObject) {
      if (mainObject[key].name === targetName) {
        return mainObject[key];
      }
    }
    return undefined;
  }

  function handleFileSelection(filename: string) {

    if(SelectedFileState.value.data){
      handleSaveCode(SelectedFileState.value.data, code)
      try {
        const content = pyodide.FS.readFile(filename, { encoding: "utf8" });
        setCode(content);
      } catch (error) {
        console.error(`Error reading ${filename} from Pyodide FS:`, error);
      }
    }
    setSelectedFile(filename)
  }

  function handleCodeOnChange(e: string | undefined) {
    if (e) {
      if (SelectedFileState.value.data == 'data' || SelectedFileState.value.data == 'readme') {

      } else {
        if (SelectedFileState.value.data == 'main') {
          setMain(e)
        }
        if (SelectedFileState.value.data == 'mymodule') {
          setModule(e)
        }
        setCode(e);
      }

    }
  }

  const handleFileUpload = async (event) => {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = async (e) => {
        const content = e.target.result;
        const fileName = file.name;
  
        // Save the uploaded file's content using handleSaveCode
        await handleSaveCode(fileName, content);
  
        // Update the file list state to include the new file
        setFileList((prevFileList) => [...prevFileList, fileName]);
  
        // Optionally, you can also select the newly uploaded file
        handleFileSelection(fileName);
      };
      reader.readAsText(file);
    }
  };

  const handleFileRemove = (file: string) => {
    const filename = file;

    pyodide.FS.unlink(filename);

    setFileList((prevFileList) => {
      const newFileList = prevFileList.filter((file) => file !== filename);
      
      // Select the previous file if the removed file was the selected one
      if (newFileList.length > 0) {
        const currentIndex = prevFileList.indexOf(filename);
        const newIndex = Math.max(currentIndex - 1, 0);
        const newSelectedFile = newFileList[newIndex];

        console.log(newSelectedFile)

        setSelectedFile(newSelectedFile);
        handleFileSelection(newSelectedFile);
      }
      
      return newFileList;
    });
  };

  return (
    <main className="h-screen flex flex-col">
    {/* <Stats/> */}
      <div className="flex-1 flex">
        {/* <div className="w-1/5 h-[99vh] bg-white border border-gray-300 flex-shrink-0">
          <div className="h-full p-2 overflow-y-auto">
            <p className="text-black text-xl font-bold mb-4" >Tasks to do</p>
            {JSONState.value.data && JSONState.value.data.appname.Task_instructions.map((task, outerIndex) => (
              <div key={outerIndex}>
                {Object.entries(task).map(([key, value], innerIndex) => (
                 <EachTask
                  key={`${key}-${outerIndex}-${innerIndex}`} // Make the key more unique
                  singleKey={key}
                  item={value}
                  head={innerIndex + 1} // Use outerIndex directly as ID
                  checked={!!checkedState[key]}
                  handleCheckboxChange={() => handleCheckboxChange(key)}
                  />
                ))}
              </div>
            ))}
          </div>
        </div> */}

        <div className="w-8/12 h-[100vh] flex flex-col">
          
          {ThemeState.value.data?.background && editorTheme ?
            <div className="flex flex-1 flex-col h-full">
              <div className="flex flex-1 h-full" style={{ flexDirection: 'column' }}>
                <div className="h-full">
                  <div className="w-30 flex-shrink-0 " style={{ color: ThemeState.value.data?.foreground, backgroundColor: ThemeState.value.data?.background, borderColor: ThemeState.value.data?.border }}>
                    <ul className="" style={{ borderColor: ThemeState.value.data?.border }}>
                      <li className="p-2" style={{ width: 'w-3/5', overflowX: 'auto' }}>
                        <ul className="flex gap-1">
                        <div className="flex items-center gap-2 pl-1 pr-3">
                        <div className="h-3 w-3 rounded-full bg-[#FF5F57]" />
                        <div className="h-3 w-3 rounded-full bg-[#FEBC2E]" />
                        <div className="h-3 w-3 rounded-full bg-[#28C840]" />
                      </div>
                        {fileList.map((file: string, index) => (
                          <div key={index} className={`flex flex-shrink-0 items-center p-1 px-2 hover:bg-zinc-100 hover:bg-opacity-10 rounded-md  ${
                            SelectedFileState.value.data === file ? 'bg-zinc-200 bg-opacity-10' : ''
                          }`}>
                            <div>
                              <img src={getIconUrl("."+file?.split('.')[1])} className="w-3 h-3"/>
                            </div>
                            <li
                              className={`text-sm cursor-pointer ml-1 ${
                                SelectedFileState.value.data === file ? 'text-green-500' : 'text-white'
                              }`}
                              style={{
                                fontSize: '12px',
                                color: SelectedFileState.value.data === file ? '#61E368' : ThemeState.value.data?.foreground,
                              }}
                              onClick={() => handleFileSelection(file)}
                            >
                              {file}
                            </li>
                            {fileList.length > 1 && (
                              <div className="ml-1">
                                <XIcon size={14} onClick={() => handleFileRemove(file)} className="opacity-50 hover:opacity-100 hover:cursor-pointer"/>
                              </div>
                              )
                            }
                          </div>
                        ))}
                        <button
                        className="remove-me group relative flex w-8 items-center justify-center overflow-hidden rounded-md hover:bg-zinc-100 hover:bg-opacity-10 "
                        onClick={() => setModalOpen(true)}
                      >
                        <div className="absolute inset-0 opacity-0 group-hover:opacity-5"/>
                        <PlusIcon className="h-4 w-4 opacity-50 group-hover:opacity-100" />
                      </button>
                        </ul>
                      </li>
                    </ul>
                  </div>
                  <div className="border-l-0" style={{
                    overflowY: 'auto',
                    height: 'calc(100% - 44px)',
                    borderColor: ThemeState.value.data?.border,
                    backgroundColor: ThemeState.value.data?.background,
                  }}>
                    <MirrorEditor onChange={handleCodeOnChange} 
                      theme={editorTheme} 
                    />
                  </div>
                </div>
                {/* <div style={{ width: '100%', justifyContent: 'center', alignItems: 'center', marginTop:'2px', marginBottom:'2px' }}>
                  <PipInstall />
                </div> */}
                {/* <div className="border border-gray-300" style={{ height: '200px', width: '100%', overflowY: 'auto' }}>
                  <Terminal handleRunCode={handleRunCode} loading={loading} />
                </div> */}
              </div>
            </div>
            :
            <div style={{flex:1, display:'flex', alignItems:'center', justifyContent:'center'}}> 
            <ClipLoader color="black" size={30} />
            </div>}
        </div>

        <div className="w-4/12 h-[100vh]0 flex-shrink-0 border-l border-[#f5f5f580]" style={{backgroundColor: ThemeState.value.data?.background}}>
          <div className="p-2">
            <div style={{ display:'flex'}}>
              <TopNav handleRunCode={async () => await handleRunCode(code)} handleSaveCode={async () => await handleSaveCode(SelectedFileState.value.data, code)} handleFileUpload={handleFileUpload}/>
              <PipInstall />
            </div>
          <div className="overflow-y-auto py-2" style={{height: 'calc(100vh - 56px)'}}>
              <Terminal handleRunCode={handleRunCode} loading={loading} />
            </div>
          </div>
        </div>
      </div>
      <CreateFileModal
            isOpen={isModalOpen}
            onClose={() => setModalOpen(false)}
            onCreate={handleNewFileCreate}
          />
    </main>
  );

}

export default App;
