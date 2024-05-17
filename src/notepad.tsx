import "./notepad.css";
import { useState, useEffect } from "react";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { ModeToggle } from "./components/ui/mode-toggle";
import { Upload, Copy, Code2 } from "lucide-react";
import { toast } from "./components/ui/use-toast";
import { Toggle } from "./components/ui/toggle";

const Notepad = () => {
  const [note, setNote] = useState("");
  const [link, setLink] = useState("");
  const [isApiMode, setIsApiMode] = useState(false);

  // Load saved note from local storage on component mount
  useEffect(() => {
    const savedNote = localStorage.getItem("note");
    if (savedNote) {
      setNote(savedNote);
    }
  }, []);

  // Save note to local storage
  const saveNote = () => {
    localStorage.setItem("note", note);

    if (!note) {
      toast({
        title: "저장 실패!",
        description: "노트를 입력해주세요.",
        variant: "destructive",
      });
      return;
    }

    toast({
      title: "저장 완료!",
      description: "노트가 저장되어 링크가 생성됩니다.",
    });

    const link = new URL(`${window.location.origin}/${makeDummyId(6)}`);

    if (isApiMode) {
      link.hostname = "api-" + link.hostname;
    }
    setLink(link.toString());
  };

  return (
    <div className="flex justify-center items-center min-h-screen">
      <Card className="w-[550px] content-center">
        <CardHeader>
          <CardTitle className="font-bold">온라인 메모장</CardTitle>
          <CardDescription>메모를 간단하게 적고 공유해보세요.</CardDescription>
        </CardHeader>
        <CardContent>
          <form>
            <div className="grid w-full items-center gap-4">
              <div className="">
                <Textarea
                  id="note"
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  placeholder="여기에 텍스트를 적으세요!"
                  rows={10}
                  cols={50}
                />
              </div>
              <div className="flex flex-col space-y-1.5">
                <div className="flex space-x-2">
                  <Input
                    id="link"
                    disabled={link ? false : true}
                    placeholder="생성 버튼을 누르면 여기에 링크가 표시됩니다."
                    value={link ? link : ""}
                    readOnly={true}
                  />
                  <Button
                    variant="outline"
                    size="icon"
                    disabled={link ? false : true}
                    onClick={() => {
                      navigator.clipboard.writeText(link);
                    }}
                  >
                    <Copy className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
          </form>
        </CardContent>
        <CardFooter className="flex justify-between">
          <div className="flex space-x-2">
            <Button variant="outline" size="icon">
              <Upload className="h-4 w-4" />
            </Button>
            <Toggle
              variant="outline"
              pressed={isApiMode}
              onClick={() => {
                if (!link) {
                  return;
                }

                const url = new URL(link);
                if (url.hostname === "api-" + window.location.hostname) {
                  url.hostname = window.location.hostname;
                } else {
                  url.hostname = "api-" + url.hostname;
                }

                setLink(url.toString());
                setIsApiMode((prev) => !prev);
              }}
              disabled={!link}
            >
              <Code2 className="h-4 w-4" />
            </Toggle>
            <ModeToggle />
          </div>
          <Button className="font-bold" onClick={saveNote}>
            생성
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
};

function makeDummyId(length: number) {
  let result = "";
  const characters =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  const charactersLength = characters.length;
  let counter = 0;
  while (counter < length) {
    result += characters.charAt(Math.floor(Math.random() * charactersLength));
    counter += 1;
  }
  return result;
}

export default Notepad;
