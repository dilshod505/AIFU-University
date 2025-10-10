import { Plus, RefreshCw } from "lucide-react";
import { useTranslations } from "next-intl";
import { Dispatch, SetStateAction } from "react";
import { Button } from "../ui/button";

const PageHeader = ({
  fetchFunction,
  setIsFormOpen,
  addTitle,
  hasAddButton = true,
  customAddButton,
}: {
  fetchFunction: () => void;
  setIsFormOpen?: Dispatch<SetStateAction<boolean>>;
  addTitle: string;
  hasAddButton?: boolean;
  customAddButton?: React.ReactNode;
}) => {
  const t = useTranslations();
  return (
    <>
      {/* Header */}
      <div className="flex flex-col gap-6 mb-5 lg:flex-row items-start lg:items-center justify-between">
        <div></div>
        <div className="flex items-center space-x-2">
          <Button variant="outline" onClick={fetchFunction}>
            <RefreshCw className="h-4 w-4 mr-2" />
            {t("refresh")}
          </Button>
          {hasAddButton && (
            <Button onClick={() => setIsFormOpen && setIsFormOpen(true)}>
              <Plus className="h-4 w-4 mr-2" />
              {t(addTitle)}
            </Button>
          )}
          {customAddButton ? customAddButton : null}
        </div>
      </div>
    </>
  );
};

export default PageHeader;
