import Link from "next/link";
import { redirect } from "next/navigation";
import {
  Checkpoint,
  createNextCheckpoint,
  listCheckpoints,
  updateCheckpointSnapshot,
} from "@/lib/checkpoints";
import CheckpointsTimeline from "@/components/checkpoints-timeline";
import {
  fetchContactsByVersion,
  fetchContactsSchema,
  ContactV1,
  ContactV2,
  ContactV3,
  type ContactsTableColumn,
} from "@/lib/contacts";
import ContactListV1 from "@/components/contact-list-v1";
import ContactListV2 from "@/components/contact-list-v2";
import ContactListV3 from "@/components/contact-list-v3";
import demo from "@/lib/demo";
import { ModeToggle } from "@/components/theme-toggle";
import { applySnapshot } from "@/lib/neon/apply-snapshot";
import { Prompt } from "@/components/prompt";
import { SubmitButton } from "@/components/submit-button";
import getProductionBranch from "@/lib/neon/branches";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { listCheckpoints as listMetaCheckpoints } from "@/lib/checkpoints";

export default async function CheckpointPage({
  params,
}: {
  params: Promise<{ checkpointId: string }>;
}) {
  const { checkpointId } = await params;
  const checkpoints = await listCheckpoints();

  let index = 0;
  for (let i = 0; i < checkpoints.length; i++) {
    const current = checkpoints[i];
    if (current.id === checkpointId) {
      index = i;
      break;
    }
  }

  const checkpoint = checkpoints[index];
  const demoStep = demo[index];
  if (!checkpoint || !demoStep) {
    return (
      <div className="flex min-h-screen flex-col">
        <div className="mx-auto flex w-full max-w-md flex-1 flex-col px-5 md:max-w-lg md:px-0 lg:max-w-xl">
          <main className="flex flex-1 flex-col justify-center">
            <h1 className="text-2xl font-semibold tracking-tight">
              Checkpoint not found
            </h1>
            <p className="mt-2 text-[#61646B] dark:text-[#94979E]">
              The requested checkpoint does not exist.
            </p>
            <Link
              className="mt-6 rounded-full bg-[#00E599] px-5 py-2.5 font-semibold tracking-tight text-[#0C0D0D] transition-colors duration-200 hover:bg-[#00E5BF] lg:px-7 lg:py-3"
              href="/"
            >
              Go home
            </Link>
          </main>
        </div>
      </div>
    );
  }

  const [contacts, [metaCheckpoints, contactsSchema]] = await Promise.all([
    fetchContactsByVersion(demoStep.version),
    Promise.all([listMetaCheckpoints(), fetchContactsSchema()]),
  ]);
  const prevCheckpoint = checkpoints[index - 1] ?? null;
  const nextStep = demo[index + 1] ?? null;

  async function advanceToAction(formData: FormData) {
    "use server";
    const targetId = formData.get("targetId");
    if (typeof targetId !== "string") return;
    const [allCheckpoints, prodBranch] = await Promise.all([
      listCheckpoints(),
      getProductionBranch(),
    ]);
    if (!prodBranch) throw new Error("Production branch not found");
    const target = allCheckpoints.find((c) => c.id === targetId);
    if (!target) return;
    await applySnapshot(target.snapshot_id, prodBranch.id);
    redirect(`/${target.id}`);
  }

  async function advanceToNext() {
    "use server";
    if (!nextStep) {
      throw new Error("No next step");
    }
    let nextCheckpoint: Checkpoint | null = null;
    if (nextStep && !checkpoint.next_checkpoint_id) {
      nextCheckpoint = await createNextCheckpoint(checkpoint.id, nextStep);
    } else {
      if (!checkpoints[index + 1]) throw new Error("No next checkpoint");
      nextCheckpoint = checkpoints[index + 1];
      const prodBranch = await getProductionBranch();
      if (!prodBranch) throw new Error("Production branch not found");
      await applySnapshot(nextCheckpoint.snapshot_id, prodBranch.id);
    }
    redirect(`/${nextCheckpoint.id}`);
  }

  async function updateSnapshotAction() {
    "use server";
    await updateCheckpointSnapshot(checkpoint.id, demoStep.version);
    redirect(`/${checkpoint.id}`);
  }

  return (
    <div className="flex min-h-screen flex-col">
      <header className="sticky top-0 z-40 w-full bg-white/80 py-3 backdrop-blur-md dark:bg-black/50">
        <div className="mx-auto flex w-full max-w-3xl items-center justify-between px-5 md:px-8 lg:px-0">
          <div className="w-24" />
          <CheckpointsTimeline
            className="mx-auto my-0"
            items={checkpoints.map((c) => ({
              id: c.id,
              snapshot_id: c.snapshot_id,
              isCurrent: c.id === checkpoint.id,
            }))}
            action={advanceToAction}
          />
          <div className="flex w-24 justify-end">
            <ModeToggle />
          </div>
        </div>
      </header>
      <div className="mx-auto flex w-full max-w-3xl flex-1 flex-col px-5 md:px-8 lg:px-0">
        <main className="flex flex-1 flex-col justify-center">
          <Prompt prompt={demoStep.prompt} label="prompt" />

          <div className="mt-12">
            <Tabs defaultValue="app">
              <TabsList>
                <TabsTrigger value="app">app</TabsTrigger>
                <TabsTrigger value="meta">meta db</TabsTrigger>
                <TabsTrigger value="schema">contacts schema</TabsTrigger>
              </TabsList>

              <TabsContent value="app">
                {demoStep.version === "v1" && (
                  <ContactListV1 contacts={contacts as ContactV1[]} />
                )}
                {demoStep.version === "v2" && (
                  <ContactListV2 contacts={contacts as ContactV2[]} />
                )}
                {demoStep.version === "v3" && (
                  <ContactListV3 contacts={contacts as ContactV3[]} />
                )}
              </TabsContent>

              <TabsContent value="meta">
                <div className="rounded-lg border border-[#E4E5E7] shadow-sm dark:border-[#303236]">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>ID</TableHead>
                        <TableHead>Snapshot</TableHead>
                        <TableHead>Next</TableHead>
                        <TableHead>Created</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {metaCheckpoints.map((mc) => (
                        <TableRow key={mc.id}>
                          <TableCell className="font-mono text-xs">
                            {mc.id}
                          </TableCell>
                          <TableCell className="font-mono text-xs">
                            {mc.snapshot_id}
                          </TableCell>
                          <TableCell className="font-mono text-xs">
                            {mc.next_checkpoint_id ?? "—"}
                          </TableCell>
                          <TableCell className="text-xs">
                            {new Date(mc.created_at).toLocaleString()}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </TabsContent>

              <TabsContent value="schema">
                <div className="rounded-lg border border-[#E4E5E7] shadow-sm dark:border-[#303236]">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Column</TableHead>
                        <TableHead>Type</TableHead>
                        <TableHead>Nullable</TableHead>
                        <TableHead>Default</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {(contactsSchema as ContactsTableColumn[]).map((col) => (
                        <TableRow key={col.column_name}>
                          <TableCell className="font-medium">
                            {col.column_name}
                          </TableCell>
                          <TableCell className="font-mono text-xs">
                            {col.data_type}
                          </TableCell>
                          <TableCell>{col.is_nullable}</TableCell>
                          <TableCell className="font-mono text-xs">
                            {col.column_default ?? "—"}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </TabsContent>
            </Tabs>
          </div>

          <div className="mt-10">
            <div className="flex items-center gap-4">
              {prevCheckpoint && (
                <form action={advanceToAction}>
                  <input
                    type="hidden"
                    name="targetId"
                    value={prevCheckpoint.id}
                  />
                  <SubmitButton
                    pendingText="Reverting..."
                    variant="outline"
                    className="rounded-full bg-transparent px-5 py-2.5 font-semibold tracking-tight text-[#0C0D0D] transition-colors duration-200 lg:px-7 lg:py-3 border border-[#E4E5E7] hover:bg-[#E4E5E7]/50 dark:text-white dark:border-[#303236]"
                  >
                    Revert
                  </SubmitButton>
                </form>
              )}

              <form action={updateSnapshotAction}>
                <SubmitButton
                  pendingText="Updating..."
                  variant="outline"
                  className="rounded-full bg-transparent px-5 py-2.5 font-semibold tracking-tight text-[#0C0D0D] transition-colors duration-200 lg:px-7 lg:py-3 border border-[#E4E5E7] hover:bg-[#E4E5E7]/50 dark:text-white dark:border-[#303236]"
                >
                  Update snapshot
                </SubmitButton>
              </form>
            </div>
          </div>

          {nextStep && (
            <div className="mt-16">
              <Prompt prompt={nextStep.prompt} label="next prompt" />
              <div className="mb-24 mt-4">
                {checkpoint.next_checkpoint_id ? (
                  <form action={advanceToNext}>
                    <SubmitButton
                      pendingText="Jumping..."
                      className="rounded-full bg-[#00E599] px-5 py-2.5 font-semibold tracking-tight text-[#0C0D0D] transition-colors duration-200 hover:bg-[#00E5BF] lg:px-7 lg:py-3"
                    >
                      Jump to next checkpoint
                    </SubmitButton>
                  </form>
                ) : (
                  <form action={advanceToNext}>
                    <SubmitButton
                      pendingText="Creating..."
                      className="rounded-full bg-[#00E599] px-5 py-2.5 font-semibold tracking-tight text-[#0C0D0D] transition-colors duration-200 hover:bg-[#00E5BF] lg:px-7 lg:py-3"
                    >
                      Create next checkpoint
                    </SubmitButton>
                  </form>
                )}
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
