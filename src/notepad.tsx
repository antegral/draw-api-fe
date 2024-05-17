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
import { Upload } from "lucide-react";
import { toast } from "./components/ui/use-toast";

const Notepad = () => {
  const [note, setNote] = useState("");
  const [link, setLink] = useState("");

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

    toast({
      title: "저장 완료!",
      description: "노트가 저장되어 링크가 생성됩니다.",
    });

    setLink(`${window.location.origin}/${makeDummyId(6)}`);
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
                <Input
                  id="name"
                  disabled={true}
                  placeholder="생성 버튼을 누르면 여기에 링크가 표시됩니다."
                  value={link ? link : ""}
                />
              </div>
            </div>
          </form>
        </CardContent>
        <CardFooter className="flex justify-between">
          <div className="flex space-x-2">
            <Button variant="outline" size="icon">
              <Upload className="h-4 w-4" />
            </Button>
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
