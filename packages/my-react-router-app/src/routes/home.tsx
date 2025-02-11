import { useAtom } from "jotai";
import { nameAtom } from "../state";
import Counter from "../components/counter";

export default function Home() {
  const [name] = useAtom(nameAtom);

  return (
    <>
      <p>Welcome to this app. The app is running as sub-process of {name} </p>
      <a href="/other">route to other</a>
    </>
  );
}
