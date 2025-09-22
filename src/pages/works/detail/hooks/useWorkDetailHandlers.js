import { toast } from "react-toastify";
// import { mediaAPI } from "../../../api/index";

// Form handling functions
export const useWorkDetailHandlers = (workData, setWorkData, setTempImagesOrder, tempImagesOrder, setEditMode) => {
  // Function to handle field changes
  const handleFieldChange = (field, value) => {
    setWorkData((prevData) => ({
      ...prevData,
      [field]: value,
    }));
  };

  // Function to handle tag selection
  const handleTagToggle = (tag, isSelected) => {
    if (isSelected) {
      setWorkData((prevData) => ({
        ...prevData,
        tag: [...prevData.tag, tag],
      }));
    } else {
      setWorkData((prevData) => ({
        ...prevData,
        tag: prevData.tag.filter((t) => t !== tag),
      }));
    }
  };

  // Function to handle credit changes (updated for array names)
  const handleCreditChange = (creditIndex, field, value) => {
    const updatedCredits = [...workData.credits];
    updatedCredits[creditIndex][field] = value;
    setWorkData((prevData) => ({
      ...prevData,
      credits: updatedCredits,
    }));
  };

  // Function to handle individual name changes within a credit
  const handleCreditNameChange = (creditIndex, nameIndex, value) => {
    const updatedCredits = [...workData.credits];
    updatedCredits[creditIndex].name[nameIndex] = value;
    setWorkData((prevData) => ({
      ...prevData,
      credits: updatedCredits,
    }));
  };

  // Function to add new name to a credit role
  const addCreditName = (creditIndex) => {
    const updatedCredits = [...workData.credits];
    updatedCredits[creditIndex].name.push("");
    setWorkData((prevData) => ({
      ...prevData,
      credits: updatedCredits,
    }));
  };

  // Function to remove a name from a credit role
  const removeCreditName = (creditIndex, nameIndex) => {
    const updatedCredits = [...workData.credits];
    updatedCredits[creditIndex].name.splice(nameIndex, 1);
    setWorkData((prevData) => ({
      ...prevData,
      credits: updatedCredits,
    }));
  };

  // Function to add new credit
  const addCredit = () => {
    setWorkData((prevData) => ({
      ...prevData,
      credits: [...prevData.credits, { role: "", name: [""] }],
    }));
  };

  // Function to save changes
  const saveChanges = () => {
    if (!workData.title.trim()) {
      toast.error("Title is required!", {
        position: "bottom-right",
        autoClose: 3000,
      });
      return;
    }

    if (!workData.client.trim()) {
      toast.error("Client is required!", {
        position: "bottom-right",
        autoClose: 3000,
      });
      return;
    }

    if (!workData.year.trim()) {
      toast.error("Year is required!", {
        position: "bottom-right",
        autoClose: 3000,
      });
      return;
    }

    console.log("Saving work data:", workData);
    setEditMode(false);

    toast.success("Work details saved successfully!", {
      position: "bottom-right",
      autoClose: 3000,
      hideProgressBar: false,
      closeOnClick: true,
      pauseOnHover: true,
      draggable: true,
    });
  };

  const cancelEdit = () => {
    setEditMode(false);
  };

  // Handle drag end for the gallery items
  const handleDragEnd = (result) => {
    if (!result.destination) return;

    const items = Array.from(tempImagesOrder);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);

    setTempImagesOrder(items);
  };

  return {
    handleFieldChange,
    handleTagToggle,
    handleCreditChange,
    handleCreditNameChange,
    addCreditName,
    removeCreditName,
    addCredit,
    saveChanges,
    cancelEdit,
    handleDragEnd,
  };
};