const staticInfo = {
  warranty: "6 Months Warranty",
  returns: "30 Days Return Policy",
  shipping: "Free Shipping on Orders Over $50",
};

export default function AdditionalInfo({
  isHovered,
}: {
  isHovered: boolean;
}) {
  return (
    <div
      className={`transition-all xl:${isHovered ? "h-[90px] opacity-100" : "h-0 opacity-0"} h-[90px] opacity-100 duration-200 overflow-hidden`}
    >
      <div className="border-t border-border-subtle pt-2.5 mt-2.5">
        <div className="text-xs text-text-secondary space-y-1">
          <div className="flex items-center">
            <span className="w-1.5 h-1.5 bg-primary-blue rounded-full mr-2 shrink-0"></span>
            Warranty: {staticInfo.warranty}
          </div>
          <div className="flex items-center">
            <span className="w-1.5 h-1.5 bg-primary-blue rounded-full mr-2 shrink-0"></span>
            Returns: {staticInfo.returns}
          </div>
          <div className="flex items-center">
            <span className="w-1.5 h-1.5 bg-primary-blue rounded-full mr-2 shrink-0"></span>
            Shipping: {staticInfo.shipping}
          </div>
        </div>
      </div>
    </div>
  );
}
