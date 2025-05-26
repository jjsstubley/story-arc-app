import { ButtonGroup, IconButton, Pagination } from "@chakra-ui/react";
import { PageChangeDetails } from "node_modules/@chakra-ui/react/dist/types/components/pagination/namespace";
import { LuChevronLeft, LuChevronRight } from "react-icons/lu";
// import { useNavigate } from "@remix-run/react";
export function PaginationComponent({
    currentPage,
    totalPages,
    searchParams,
    onPageChange
  }: {
    currentPage: number;
    totalPages: number;
    searchParams: URLSearchParams;
    onPageChange: (params: string) => void;
  }) {
    // const navigate = useNavigate()
    const createLink = (details: PageChangeDetails) => {
        const newParams = new URLSearchParams(searchParams);
        newParams.set("page", details.page.toString());

        onPageChange(newParams.toString());
    };
  
    return (
        <Pagination.Root count={totalPages} page={currentPage} pageSize={20} maxW="240px" onPageChange={(details) => createLink(details)}>
            <ButtonGroup variant="ghost" size="sm" w="full">
                <Pagination.PageText format="long" flex="1" />
                <Pagination.PrevTrigger asChild>
                <IconButton>
                    <LuChevronLeft />
                </IconButton>
                </Pagination.PrevTrigger>
                <Pagination.NextTrigger asChild>
                <IconButton>
                    <LuChevronRight />
                </IconButton>
                </Pagination.NextTrigger>
            </ButtonGroup>
        </Pagination.Root>
    );
}