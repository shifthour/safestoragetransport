import VendorPanel from "../components/VendorPanel";
import { listVendors } from "@/lib/vendors";
import { getSession } from "@/lib/session";

export const dynamic = "force-dynamic";

export default async function VendorsPage() {
  const { vendors, source } = await listVendors();
  const user = await getSession();
  return <VendorPanel initial={vendors} source={source} user={user} />;
}
