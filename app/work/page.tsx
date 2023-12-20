import { Navbar } from "@/app/_components/navbar";
import { WorkList } from "@/app/_components/work-block";
import { Spacer } from "@/components/spacer";
import { getAllWork } from "@/modules/keystatic";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Work Experience",
};

export default async function WorksPage() {
  const allWork = await getAllWork();
  return (
    <>
      <Navbar />
      <Spacer className="h-8" />

      <main className="space-x">
        <h1 className="text-5xl font-bold">Work</h1>
        <Spacer className="h-12" />

        <WorkList works={allWork} />

        <Spacer className="h-28"/>
      </main>
    </>
  );
}
