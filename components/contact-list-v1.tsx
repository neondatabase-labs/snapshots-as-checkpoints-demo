"use client";
import React, { useMemo, useState } from "react";
import { usePathname } from "next/navigation";
import {
  createContactV1Action,
  deleteContactAction,
  updateContactV1Action,
} from "@/lib/contacts";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { SubmitButton } from "@/components/submit-button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogTrigger,
} from "@/components/ui/dialog";
import { MoreHorizontal } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

export type ContactV1 = { id: string; name: string; email: string };

export default function ContactListV1({
  contacts,
  dbUrl,
}: {
  contacts: ContactV1[];
  dbUrl: string;
}) {
  const pathname = usePathname();
  const [addOpen, setAddOpen] = useState(false);
  const [editContact, setEditContact] = useState<ContactV1 | null>(null);
  const sorted = useMemo(
    () => [...contacts].sort((a, b) => a.name.localeCompare(b.name)),
    [contacts],
  );

  return (
    <div className="mt-6 w-full overflow-x-auto">
      <div className="mb-4 flex items-center justify-between">
        <h3 className="text-sm font-semibold tracking-tight text-[#61646B] dark:text-[#94979E]">
          Contacts
        </h3>
        <Dialog open={addOpen} onOpenChange={setAddOpen}>
          <DialogTrigger asChild>
            <Button className="rounded-full bg-[#00E599] text-[#0C0D0D] hover:bg-[#00E5BF]">
              Add Contact
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add contact</DialogTitle>
            </DialogHeader>
            <form
              action={async (formData: FormData) => {
                await createContactV1Action(formData);
                setAddOpen(false);
              }}
              className="space-y-3"
            >
              <input type="hidden" name="dbUrl" value={dbUrl} />
              <input type="hidden" name="path" value={pathname} />
              <div className="grid gap-2">
                <Label htmlFor="name">Name</Label>
                <Input id="name" name="name" placeholder="Name" required />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="Email"
                  required
                />
              </div>
              <DialogFooter>
                <SubmitButton
                  pendingText="Saving..."
                  className="bg-[#00E599] text-[#0C0D0D] hover:bg-[#00E5BF]"
                >
                  Save
                </SubmitButton>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="rounded-lg border border-[#E4E5E7] shadow-sm dark:border-[#303236]">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-1/2">Name</TableHead>
              <TableHead>Email</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {sorted.map((c) => (
              <TableRow key={c.id}>
                <TableCell className="font-medium">{c.name}</TableCell>
                <TableCell>{c.email}</TableCell>
                <TableCell className="text-right">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant="outline"
                        size="icon"
                        className="rounded-full"
                        aria-label="Actions"
                      >
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuLabel>Actions</DropdownMenuLabel>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem onSelect={() => setEditContact(c)}>
                        Edit
                      </DropdownMenuItem>
                      <DropdownMenuItem asChild>
                        <form action={deleteContactAction}>
                          <input type="hidden" name="id" value={c.id} />
                          <input type="hidden" name="path" value={pathname} />
                          <input type="hidden" name="dbUrl" value={dbUrl} />
                          <button
                            type="submit"
                            className="w-full text-left text-red-600"
                          >
                            Delete
                          </button>
                        </form>
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <Dialog
        open={!!editContact}
        onOpenChange={(o) => !o && setEditContact(null)}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit contact</DialogTitle>
          </DialogHeader>
          {editContact && (
            <form
              action={async (formData: FormData) => {
                await updateContactV1Action(formData);
                setEditContact(null);
              }}
              className="space-y-3"
            >
              <input type="hidden" name="id" value={editContact.id} />
              <input type="hidden" name="path" value={pathname} />
              <input type="hidden" name="dbUrl" value={dbUrl} />
              <div className="grid gap-2">
                <Label htmlFor="edit-name">Name</Label>
                <Input
                  id="edit-name"
                  name="name"
                  defaultValue={editContact.name}
                  required
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="edit-email">Email</Label>
                <Input
                  id="edit-email"
                  name="email"
                  type="email"
                  defaultValue={editContact.email}
                  required
                />
              </div>
              <DialogFooter>
                <SubmitButton
                  pendingText="Saving..."
                  className="bg-[#00E599] text-[#0C0D0D] hover:bg-[#00E5BF]"
                >
                  Save
                </SubmitButton>
              </DialogFooter>
            </form>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
