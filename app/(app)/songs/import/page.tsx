import { ImportSongForm } from "@/components/song/ImportSongForm";
import { BulkImportSongsForm } from "@/components/song/BulkImportSongsForm";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";

export default function ImportSongPage() {
  return (
    <div className="mx-auto w-full max-w-3xl p-4">
      <h1 className="mb-4 text-xl font-semibold">Importar música</h1>
      <Tabs defaultValue="single">
        <TabsList>
          <TabsTrigger value="single">Importar 1 música (.txt)</TabsTrigger>
          <TabsTrigger value="bulk">Importar em lote (.zip)</TabsTrigger>
        </TabsList>
        <TabsContent value="single">
          <ImportSongForm />
        </TabsContent>
        <TabsContent value="bulk">
          <BulkImportSongsForm />
        </TabsContent>
      </Tabs>
    </div>
  );
}
