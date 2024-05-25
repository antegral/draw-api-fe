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
import { Upload, Copy, Code2, ArrowRight } from "lucide-react";
import { toast } from "./components/ui/use-toast";
import { Toggle } from "./components/ui/toggle";
import Axios from "axios";

const API_ENDPOINT = "http://192.168.1.100:47294/clip";

const Notepad = () => {
  const [note, setNote] = useState("");
  const [link, setLink] = useState("");
  const [id, setId] = useState(0);
  const [isApiMode, setIsApiMode] = useState(false);

  // Load saved note from local storage on component mount
  useEffect(() => {
    const savedNote = localStorage.getItem("note");
    if (savedNote) {
      setNote(savedNote);
    }

    const path = window.location.pathname;
    if (path.length > 1) {
      const id = path.substring(1);
      Axios.get(API_ENDPOINT + "/" + id)
        .then((resp) => {
          if (resp.status !== 200) {
            toast({
              title: "로드 실패!",
              description: "서버로부터 잘못된 응답을 수신했습니다.",
              variant: "destructive",
            });
          }

          if (typeof resp.data?.BOARD_CONTENT !== "string") {
            console.error(`Invalid response: ${JSON.stringify(resp.data)}`);
            toast({
              title: "로드 실패!",
              description: "유효하지 않거나 없는 노트입니다.",
              variant: "destructive",
            });
          }

          setId(resp.data.BOARD_SN);
          setLink(window.location.href);
          setNote(resp.data.BOARD_CONTENT);
        })
        .catch((e) => {
          console.error(e);
          toast({
            title: "로드 실패!",
            description: "노트를 불러오는데 실패했습니다.",
            variant: "destructive",
          });
        });
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

    Axios.post(API_ENDPOINT, {
      boardContent: note,
    })
      .then((resp) => {
        if (resp.status !== 200) {
          toast({
            title: "저장 실패!",
            description: "서버로부터 잘못된 응답을 수신했습니다.",
            variant: "destructive",
          });
        }

        if (typeof resp.data?.id !== "number" || resp.data?.id < 0) {
          toast({
            title: "저장 실패!",
            description: "서버로부터 잘못된 값을 수신했습니다.",
            variant: "destructive",
          });
        }

        const link = new URL(`${window.location.origin}/${resp.data.id}`);

        console.log(`API Mode: ${isApiMode}`);
        if (isApiMode) {
          link.hostname = API_ENDPOINT + "/" + resp.data.id;
        }

        setId(resp.data.id);

        console.log(`Link: ${link.toString()}`);
        setLink(link.toString());

        toast({
          title: "저장 완료!",
          description: "노트가 저장되어 링크가 생성됩니다.",
        });
      })
      .catch((e) => {
        console.error(e);
        toast({
          title: "저장 실패!",
          description: "내부 처리 오류가 발생했습니다.",
          variant: "destructive",
        });
      });
  };

  return (
    <div className="flex justify-center items-center min-h-screen">
      <Card className="w-[550px] content-center">
        <CardHeader>
          <CardTitle className="font-bold">온라인 메모장</CardTitle>
          <CardDescription>메모를 간단하게 적고 공유해보세요.</CardDescription>
        </CardHeader>
        <CardContent>
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

                let url = new URL(link);
                console.log(`DevMode Switching... URL: ${url.toString()}`);

                if (url.toString().startsWith(API_ENDPOINT)) {
                  console.log(`DEVMODE -> NORMAL / ID: ${id}`);
                  url = new URL(
                    `${window.location.protocol}//${window.location.hostname}${
                      window.location.port == "80" ||
                      window.location.port == "443"
                        ? ""
                        : ":" + window.location.port
                    }/${id}`
                  );
                } else {
                  console.log(`NORMAL -> DEVMODE`);
                  url = new URL(API_ENDPOINT + "/" + id);
                }

                console.log(`DevMode Switched. URL: ${url.toString()}`);
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
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
};

// function makeDummyId(length: number) {
//   let result = "";
//   const characters =
//     "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
//   const charactersLength = characters.length;
//   let counter = 0;
//   while (counter < length) {
//     result += characters.charAt(Math.floor(Math.random() * charactersLength));
//     counter += 1;
//   }
//   return result;
// }

export default Notepad;
