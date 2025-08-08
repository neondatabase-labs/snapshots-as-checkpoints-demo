"use client";
import React, { useMemo, useState } from "react";
import { usePathname } from "next/navigation";
import {
  createContactV3Action,
  deleteContactAction,
  updateContactV3Action,
} from "@/lib/contacts";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { MoreHorizontal } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

export type ContactV3 = {
  id: string;
  name: string;
  email: string;
  role: string | null;
  company: string | null;
  tags: string[] | null;
};

export default function ContactListV3({ contacts }: { contacts: ContactV3[] }) {
  const pathname = usePathname();
  const [addOpen, setAddOpen] = useState(false);
  const [editContact, setEditContact] = useState<ContactV3 | null>(null);
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
                await createContactV3Action(formData);
                setAddOpen(false);
              }}
              className="space-y-3"
            >
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
              <div className="grid gap-2">
                <Label htmlFor="role">Role</Label>
                <Input id="role" name="role" placeholder="Role" />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="company">Company</Label>
                <Input id="company" name="company" placeholder="Company" />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="tags">Tags</Label>
                <Input
                  id="tags"
                  name="tags"
                  placeholder="tags (comma-separated)"
                />
              </div>
              <DialogFooter>
                <Button
                  type="submit"
                  className="bg-[#00E599] text-[#0C0D0D] hover:bg-[#00E5BF]"
                >
                  Save
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="rounded-lg border border-[#E4E5E7] shadow-sm dark:border-[#303236]">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-1/6">Name</TableHead>
              <TableHead className="w-1/6">Email</TableHead>
              <TableHead className="w-1/6">Role</TableHead>
              <TableHead className="w-1/6">Company</TableHead>
              <TableHead className="w-2/6">Tags</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {sorted.map((c) => (
              <TableRow key={c.id}>
                <TableCell className="font-medium">{c.name}</TableCell>
                <TableCell>{c.email}</TableCell>
                <TableCell>{c.role ?? "—"}</TableCell>
                <TableCell>{c.company ?? "—"}</TableCell>
                <TableCell>
                  <div className="flex flex-wrap gap-2">
                    {(c.tags ?? []).map((tag, idx) => (
                      <span
                        key={`${c.id}_${idx}`}
                        className="rounded-full border px-3 py-1.5 text-xs font-semibold border-[#00E599]/20 bg-[#00E599]/10 text-[#1a8c66] dark:bg-[#00E599]/10 dark:text-[#00E599]"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </TableCell>
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
                await updateContactV3Action(formData);
                setEditContact(null);
              }}
              className="space-y-3"
            >
              <input type="hidden" name="id" value={editContact.id} />
              <input type="hidden" name="path" value={pathname} />
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
              <div className="grid gap-2">
                <Label htmlFor="edit-role">Role</Label>
                <Input
                  id="edit-role"
                  name="role"
                  defaultValue={editContact.role ?? ""}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="edit-company">Company</Label>
                <Input
                  id="edit-company"
                  name="company"
                  defaultValue={editContact.company ?? ""}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="edit-tags">Tags</Label>
                <Input
                  id="edit-tags"
                  name="tags"
                  defaultValue={(editContact.tags ?? []).join(", ")}
                />
              </div>
              <DialogFooter>
                <Button
                  type="submit"
                  className="bg-[#00E599] text-[#0C0D0D] hover:bg-[#00E5BF]"
                >
                  Save
                </Button>
              </DialogFooter>
            </form>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
