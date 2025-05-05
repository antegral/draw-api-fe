import "./notepad.css";
import { useState } from "react";
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
import { ArrowRight, Dices, Info } from "lucide-react";
import { toast } from "./components/ui/use-toast";
import { Toggle } from "./components/ui/toggle";
import Axios from "axios";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./components/ui/select";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "./components/ui/popover";

const API_ENDPOINT = "https://ai-exp.antegral.net/v1/draw/character-sheet";

const Notepad = () => {
  const getRandom = () => {
    return Math.floor(Math.random() * Number.MAX_SAFE_INTEGER) + 1;
  };

  const [isRunning, setIsRunning] = useState(false);
  const [model, setModel] = useState("NoobVPencil-XL-VPred-v0.5.1");
  const [random, setRandom] = useState(true);
  const [seed, setSeed] = useState(getRandom());
  const [imageData, setImageData] = useState("");
  const [positive, setPositive] = useState("");
  const [negative, setNegative] = useState("");

  // Load saved note from local storage on component mount
  // useEffect(() => {
  //   const savedNote = localStorage.getItem("note");
  //   if (savedNote) {
  //     setNote(savedNote);
  //   }

  //   const path = window.location.pathname;
  //   if (path.length > 1) {
  //     const id = path.substring(1);
  //     Axios.get(API_ENDPOINT + "/" + id)
  //       .then((resp) => {
  //         if (resp.status !== 200) {
  //           toast({
  //             title: "로드 실패!",
  //             description: "서버로부터 잘못된 응답을 수신했습니다.",
  //             variant: "destructive",
  //           });
  //         }

  //         if (typeof resp.data?.BOARD_CONTENT !== "string") {
  //           console.error(`Invalid response: ${JSON.stringify(resp.data)}`);
  //           toast({
  //             title: "로드 실패!",
  //             description: "유효하지 않거나 없는 노트입니다.",
  //             variant: "destructive",
  //           });
  //         }

  //         setId(resp.data.BOARD_SN);
  //         setLink(window.location.href);
  //         setNote(resp.data.BOARD_CONTENT);
  //       })
  //       .catch((e) => {
  //         console.error(e);
  //         toast({
  //           title: "로드 실패!",
  //           description: "노트를 불러오는데 실패했습니다.",
  //           variant: "destructive",
  //         });
  //       });
  //   }
  // }, []);

  const drawStart = () => {
    localStorage.setItem("model", model);
    localStorage.setItem("seed", seed.toString());
    localStorage.setItem("positive", positive);
    localStorage.setItem("negative", negative);

    if (!positive) {
      toast({
        title: "입력 오류!",
        description: "긍정 프롬프트가 비어있어요.",
        variant: "destructive",
      });
      return;
    }

    console.log({
      model: model,
      prompt: {
        positive: positive,
        negative: negative,
      },
      seed: seed,
    });

    setIsRunning(true);
    toast({
      title: "생성 중!",
      description: "잠시만 기다려주세요! (40~60초 소요될 수 있어요.)",
    });

    Axios.post(
      API_ENDPOINT,
      {
        model: model,
        prompt: {
          positive: positive,
          negative: negative,
        },
        seed: seed,
      },
      {
        responseType: "arraybuffer",
      }
    )
      .then((response) => {
        // Content-Type 헤더 확인
        const contentType = response.headers["content-type"];

        // JSON 응답인 경우
        if (contentType && contentType.includes("application/json")) {
          return new Promise((resolve) => {
            const reader = new FileReader();
            reader.onload = () => {
              // JSON 문자열을 파싱하여 JavaScript 객체로 변환
              const data = JSON.parse(reader.result as string);
              resolve(data);
            };
            reader.readAsText(response.data);
          });
        }
        // PNG 이미지인 경우
        else if (contentType && contentType.includes("image/png")) {
          return new Promise((resolve) => {
            const reader = new FileReader();
            reader.onload = () => {
              // Base64 인코딩된 이미지 데이터
              const base64String = reader.result;
              resolve({ type: "image", data: base64String });
            };

            // ArrayBuffer를 Blob으로 변환
            const blob = new Blob([response.data], { type: "image/png" });
            reader.readAsDataURL(blob);
          });
        }
        // 그 외 형식
        else {
          throw new Error("지원하지 않는 응답 형식입니다.");
        }
      })
      .then((result: unknown) => {
        const typedResult = result as { type: string; data: string };

        if (typedResult.type === "image") {
          // 이미지 처리
          console.log("Image (Base64):", typedResult.data);
          setImageData(typedResult.data);
        } else {
          // JSON 데이터 처리
          toast({
            title: "생성 실패!",
            description: "서버로부터 잘못된 응답을 수신했어요.",
            variant: "destructive",
          });
          setIsRunning(false);
          return;
        }

        if (random) {
          setSeed(getRandom());
        }

        setIsRunning(false);
        toast({
          title: "생성 완료!",
          description: "그림을 생성했어요.",
        });
      })
      .catch((e) => {
        console.error(e);
        toast({
          title: "생성 실패!",
          description: "내부 처리 오류가 발생했어요.",
          variant: "destructive",
        });
        setIsRunning(false);
      });
  };

  return (
    <div className="flex justify-center items-center min-h-screen">
      <Card className="w-[500px] content-center">
        <CardHeader>
          <CardTitle className="font-bold">DRAW/API</CardTitle>
          <CardDescription>캐릭터 시트를 만들어보세요!</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid w-full items-center gap-4">
            <img
              src={imageData ? `${imageData}` : "/preview.png"}
              alt="Preview"
              className="w-full max-w-[20rem] h-[20rem] bg-muted rounded-lg border object-cover mx-auto"
            />
            <div className="space-y-2">
              <Select
                defaultValue="NoobVPencil-XL-VPred-v0.5.1"
                onValueChange={(value) => setModel(value)}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="모델 선택" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="NoobVPencil-XL-VPred-v0.5.1">
                    NoobVPencil-XL-VPred-v0.5.1
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Textarea
                id="positive"
                value={positive}
                onChange={(e) =>
                  setPositive(
                    e.target.value.replace(/[^a-zA-Z0-9().,:\s]/g, "")
                  )
                }
                placeholder="긍정 프롬프트"
                rows={5}
                cols={30}
              />
              <Textarea
                id="negative"
                value={negative}
                onChange={(e) =>
                  setNegative(
                    e.target.value.replace(/[^a-zA-Z0-9().,:\s]/g, "")
                  )
                }
                placeholder="부정 프롬프트 (선택)"
                rows={5}
                cols={30}
              />{" "}
            </div>{" "}
            <div className="flex items-center gap-1 text-sm text-muted-foreground">
              <Info className="h-4 w-4" />
              <span>
                프롬프트는 쉼표로 구분된{" "}
                <a
                  href="https://danbooru.donmai.us/posts"
                  className="underline"
                >
                  danbooru 태그
                </a>{" "}
                단위로, 영어만 지원해요.
              </span>{" "}
            </div>
            {/* <div className="flex flex-col space-y-1.5">
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
            </div> */}
          </div>
        </CardContent>
        <CardFooter className="flex justify-between">
          <div className="flex space-x-2">
            <ModeToggle />
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  size="icon"
                  data-state={random ? "on" : "off"}
                >
                  <Dices
                    className={`absolute h-[1.2rem] w-[1.2rem] ${
                      random ? "text-primary" : ""
                    }`}
                  />
                  <span className="sr-only">시드</span>
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-80">
                <div className="grid gap-4">
                  <div className="space-y-1">
                    <h4 className="font-medium leading-none">시드</h4>
                    <p className="text-sm text-muted-foreground">
                      I'm feeling lucky~
                    </p>
                  </div>
                  <div className="grid gap-2">
                    <div className="grid grid-cols-[1fr,auto] items-center gap-2">
                      <Input
                        id="seed"
                        type="text"
                        className="h-8"
                        disabled={random}
                        value={seed.toString()}
                        onChange={(e) => {
                          const val = e.target.value;
                          if (val === "") {
                            setSeed(1);
                          } else if (/^\d+$/.test(val)) {
                            const num = parseInt(val);
                            if (
                              !isNaN(num) &&
                              num >= 0 &&
                              num <= Number.MAX_SAFE_INTEGER
                            ) {
                              setSeed(num);
                            }
                          }
                        }}
                        onKeyDown={(e) => {
                          if (e.key === "ArrowUp") {
                            e.preventDefault();
                            setSeed((prev) =>
                              Math.min(prev + 1, Number.MAX_SAFE_INTEGER)
                            );
                          } else if (e.key === "ArrowDown") {
                            e.preventDefault();
                            setSeed((prev) => Math.max(prev - 1, 0));
                          }
                        }}
                        placeholder="시드 값"
                      />{" "}
                      <Toggle
                        variant="outline"
                        size="sm"
                        className="h-8"
                        pressed={random}
                        onPressedChange={(pressed) => {
                          setRandom(pressed);
                          if (pressed) {
                            setSeed(getRandom());
                          }
                        }}
                      >
                        <Dices className="h-4 w-4" />
                      </Toggle>
                    </div>
                  </div>
                </div>
              </PopoverContent>
            </Popover>
          </div>
          <Button
            className="font-bold"
            onClick={drawStart}
            disabled={isRunning}
          >
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
