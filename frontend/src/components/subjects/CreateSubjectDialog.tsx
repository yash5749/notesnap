import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "../ui/dialog";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Textarea } from "../ui/textarea";
import { useCreateSubject } from "../../hooks/useCreateSubject";

export default function CreateSubjectDialog() {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [syllabus, setSyllabus] = useState("");

  const { mutate, isPending } = useCreateSubject();

  const handleCreate = () => {
    if (!name.trim()) return;

    mutate(
      { name, description, syllabus },
      {
        onSuccess: () => {
          setOpen(false);
          setName("");
          setDescription("");
          setSyllabus("");
        },
      }
    );
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm">+ Create Subject</Button>
      </DialogTrigger>

      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Create Subject</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <Input
            placeholder="Subject name"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />

          <Input
            placeholder="Description (optional)"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />

          <Textarea
            placeholder="Syllabus (optional)"
            value={syllabus}
            onChange={(e) => setSyllabus(e.target.value)}
          />

          <div className="flex justify-end">
            <Button onClick={handleCreate} disabled={isPending}>
              {isPending ? "Creating..." : "Create"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
