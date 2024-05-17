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

const Notepad = () => {
  const [note, setNote] = useState("");

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
    alert("Note saved!");
  };

  return (
    <div className="flex justify-center items-center min-h-screen">
      <Card className="w-[550px] content-center">
        <CardHeader>
          <CardTitle>온라인 메모장</CardTitle>
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
                  value={"https://notepad.antegral.net/dLi39P2v"}
                />
              </div>
            </div>
          </form>
        </CardContent>
        <CardFooter className="flex justify-between">
          <Button onClick={saveNote}>생성</Button>
        </CardFooter>
      </Card>
    </div>
  );
};

export default Notepad;
