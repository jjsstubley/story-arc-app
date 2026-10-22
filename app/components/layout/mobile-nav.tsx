import { Box, CloseButton, Drawer, Flex, Heading, Portal, Text } from "@chakra-ui/react";
import { Link, useLocation } from "@remix-run/react";
import { Session } from "@supabase/supabase-js";
import { useEffect, useState } from "react";
import { LuHouse } from "react-icons/lu";
import { getNavSections, type FilterOptionsProps } from "~/components/sidepanel/nav-sections";
import { InsideModal } from "~/shared/ui/portal-context";

/** Height of the bar, excluding the device's safe-area inset. Pages pad their bottom by this much on mobile. */
export const MOBILE_NAV_HEIGHT = "64px";

const tabStyles = {
  flex: 1,
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  justifyContent: "center",
  gap: 1,
  fontSize: "2xs",
  fontWeight: "medium",
  cursor: "pointer",
} as const;

/** Bottom tab bar on small screens: Home, plus each side-panel section opened as a bottom sheet */
export default function MobileNav({ filters, session }: { filters: FilterOptionsProps; session: Session | null }) {
  const location = useLocation();
  const [openSection, setOpenSection] = useState<string | null>(null);
  const sections = getNavSections(filters, session);
  const active = sections.find((section) => section.value === openSection);

  // Close the sheet once a link inside it has navigated
  useEffect(() => {
    setOpenSection(null);
  }, [location.key]);

  return (
    <>
      <Flex
        as="nav"
        aria-label="Main"
        display={{ base: "flex", md: "none" }}
        position="fixed"
        bottom={0}
        insetX={0}
        zIndex="sticky"
        height={`calc(${MOBILE_NAV_HEIGHT} + env(safe-area-inset-bottom))`}
        pb="env(safe-area-inset-bottom)"
        bg="bg.panel"
        borderTop="1px solid"
        borderColor="border"
      >
        <Box asChild {...tabStyles} color={location.pathname === "/" && !openSection ? "orange.400" : "fg.muted"}>
          <Link to="/">
            <LuHouse size={20} />
            Home
          </Link>
        </Box>
        {sections.map((section) => (
          <Box
            as="button"
            key={section.value}
            {...tabStyles}
            color={openSection === section.value ? "orange.400" : "fg.muted"}
            aria-expanded={openSection === section.value}
            onClick={() => setOpenSection(openSection === section.value ? null : section.value)}
          >
            {section.icon}
            {section.tabLabel}
          </Box>
        ))}
      </Flex>

      <Drawer.Root
        open={Boolean(active)}
        onOpenChange={(e) => !e.open && setOpenSection(null)}
        placement="bottom"
      >
        <Portal>
          <Drawer.Backdrop />
          <Drawer.Positioner>
            <Drawer.Content roundedTop="xl" maxH="85dvh">
              <Drawer.Header>
                <Box>
                  <Heading as="h2" size="lg">{active?.label}</Heading>
                  <Text fontSize="xs" color="fg.muted">{active?.description}</Text>
                </Box>
              </Drawer.Header>
              <Drawer.Body pb="calc(16px + env(safe-area-inset-bottom))">
                <InsideModal>{active?.content}</InsideModal>
              </Drawer.Body>
              <Drawer.CloseTrigger asChild>
                <CloseButton size="sm" />
              </Drawer.CloseTrigger>
            </Drawer.Content>
          </Drawer.Positioner>
        </Portal>
      </Drawer.Root>
    </>
  );
}
