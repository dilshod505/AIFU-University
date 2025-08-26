import { Trash } from "lucide-react";
import { useTranslations } from "next-intl";
import { ReactNode } from "react";
import TooltipBtn from "./tooltip-btn";
import { Button } from "./ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "./ui/dialog";

const DeleteActionDialog = ({
  onConfirm,
  title,
}: {
  onConfirm: () => void;
  title: string | ReactNode;
}) => {
  const t = useTranslations();

  return (
    <Dialog>
      <DialogTrigger asChild>
        <TooltipBtn title={title} size={"sm"} variant="destructive">
          <Trash />
        </TooltipBtn>
      </DialogTrigger>
      <DialogContent className="bg-white dark:bg-background">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>
            {t(
              "Are you sure you want to delete this? This action cannot be undone"
            )}
          </DialogDescription>
          <div className="flex justify-end mt-2 items-center gap-2">
            <DialogClose asChild>
              <Button size={"sm"} variant={"view"}>
                {t("Cancel")}
              </Button>
            </DialogClose>
            <TooltipBtn onClick={onConfirm} size={"sm"} variant={"destructive"}>
              {t("delete")}
            </TooltipBtn>
          </div>
        </DialogHeader>
      </DialogContent>
    </Dialog>
  );
};

export default DeleteActionDialog;
