import AddCategory from "../features/admin/components/AddCategory";
import CategoryTable from "../features/admin/components/CategoryTable";
import { Navbar } from "../features/navigation/components/Navbar";

export const AdminCateogryPage = () => {
  return (
    <>
      <Navbar />
      <div className="pt-[55px]">
        <AddCategory />
        <CategoryTable />
      </div>
    </>
  );
};
