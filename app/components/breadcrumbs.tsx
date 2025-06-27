import { Breadcrumb } from "@chakra-ui/react";
import { useLocation } from "react-router-dom"; // use useLocation from Remix if needed

export const DynamicBreadcrumbs = () => {
  const location = useLocation();
  const pathnames = location.pathname.split('/').filter(Boolean); // remove empty segments
    console.log('DynamicBreadcrumbs', pathnames);
  return (
    <Breadcrumb.Root size="md" variant="plain">
        <Breadcrumb.List>
            <Breadcrumb.Item>
                <Breadcrumb.Link href="/" _hover={{ color: 'orange.300'}}>Home</Breadcrumb.Link>
            </Breadcrumb.Item>

            { pathnames.length !== 0 && (<Breadcrumb.Separator />)}
            {pathnames.map((segment, index) => {
                const href = '/' + pathnames.slice(0, index + 1).join('/');
                console.log('href', href);
                const label = decodeURIComponent(segment)
                .replace(/-/g, ' ')
                .replace(/\b\w/g, char => char.toUpperCase());

                return (
                <>
                    <Breadcrumb.Item key={href}>
                        {
                            index < pathnames.length - 1 ? ( 
                                <>
                                    <Breadcrumb.Link href={href} _hover={{ color: 'orange.400'}}>
                                        {label}
                                    </Breadcrumb.Link>
                                </>
                            ) : (
                                <Breadcrumb.CurrentLink>
                                    {label}
                                </Breadcrumb.CurrentLink>
                            )
                        }
                    </Breadcrumb.Item>
                    {index < pathnames.length - 1 && (<Breadcrumb.Separator />)}
                </>
                );
            })}
        </Breadcrumb.List>
    </Breadcrumb.Root>
  );
};