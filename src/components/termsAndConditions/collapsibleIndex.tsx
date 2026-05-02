import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { useDesktopResolution } from "@/hooks/useResolution";
import Index from ".";

export default function CollapsibleIndex({ prefix, currentURI }: { prefix: string; currentURI: string }) {
  const isDesktop = useDesktopResolution({ resolution: 768 });

  return (
    <>
      {isDesktop ? (
        <Index
          currentURI={currentURI}
          prefix={prefix}
        />
      ) : (
        <Accordion
          type="single"
          collapsible
          className="w-full"
        >
          <AccordionItem value="index">
            <AccordionTrigger className="[&>*:first-child]:flex! button button-ghost bg-light-neutral/50 w-full! rounded-full px-5 py-3">Navegación</AccordionTrigger>

            <AccordionContent className="mt-5">
              <Index
                currentURI={currentURI}
                prefix={prefix}
              />
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      )}
    </>
  );
}
