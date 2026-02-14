import CreateSubjectDialog from "./CreateSubjectDialog";

export default function SubjectHeader() {
  return (
    <div className="border rounded-lg p-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Select Subject</h3>
        <CreateSubjectDialog />
      </div>
    </div>
  );
}
