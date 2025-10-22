import { toast } from "react-toastify";
import { worksAPI } from "../../../../api/index";

// Form handling functions
export const useWorkCreateHandlers = (workData, setWorkData, setTempImagesOrder, tempImagesOrder, isSaving, setIsSaving, navigate) => {
  
  // Transform workData to API format
  const transformToAPIFormat = (data, status = 'draft') => {
    return {
      title: data.title,
      client: data.client,
      category: data.category,
      year: data.year,
      description: data.description,
      hero_banner_image: data.heroBannerImage,
      hero_banner_position_x: data.heroBannerPositionX,
      hero_banner_position_y: data.heroBannerPositionY,
      video_project_src: data.videoProjectSrc,
      video_project_poster: data.videoProjectPosterUrl,
      video_vimeo_url: data.videoVimeoUrl,
      video_youtube_url: data.videoYoutubeUrl,
      video_cloudflare_url: data.videoCloudflareUrl,
      tags: data.tag, // Convert from 'tag' to 'tags'
      status: status,
      credits: data.credits.map((credit, index) => ({
        role: credit.role,
        names: credit.name, // Convert from 'name' to 'names'
        order: index + 1
      })),
      gallery_items: data.images.map((item, index) => ({
        type: item.type,
        images: Array.isArray(item.imageUrl) ? item.imageUrl : [item.imageUrl],
        order: index + 1
      }))
    };
  };

  // Validate required fields (same validation for both draft and publish)
  const validateWorkData = (data) => {
    const errors = [];
    
    // Priority order for validation (highest to lowest priority)
    // 1. Hero banner image (most visible)
    if (!data.heroBannerImage.trim()) {
      errors.push({
        field: 'heroBannerImage',
        message: 'Hero banner image is required',
        priority: 1,
        scrollTarget: 'hero-banner-button'
      });
    }
    
    // 2. Tags (categorization)
    if (data.tag.length === 0) {
      errors.push({
        field: 'tags',
        message: 'Please select at least one tag',
        priority: 2,
        scrollTarget: 'tags-section'
      });
    }
    // 3. Title (main identifier)
    if (!data.client.trim()) {
      errors.push({
        field: 'client',
        message: 'Client is required',
        priority: 3,
        scrollTarget: 'client-field'
      });
    }

    // 4. Client (important business info)
    if (!data.title.trim()) {
      errors.push({
        field: 'title',
        message: 'Title is required',
        priority: 4,
        scrollTarget: 'title-field'
      });
    }
    
    
    // 5. Credits validation (comprehensive check)
    const validCredits = data.credits.filter(credit => 
      credit.role.trim() && credit.name.some(name => name.trim())
    );
    
    // Check for credits with empty names
    const creditsWithEmptyNames = data.credits.filter(credit => 
      credit.role.trim() && credit.name.some(name => !name.trim())
    );
    
    if (creditsWithEmptyNames.length > 0) {
      errors.push({
        field: 'credits',
        message: 'Some credits have empty name fields. Please fill in all names or remove empty fields.',
        priority: 5,
        scrollTarget: 'credits-section'
      });
    } else if (validCredits.length === 0) {
      errors.push({
        field: 'credits',
        message: 'At least one credit with role and name is required',
        priority: 5,
        scrollTarget: 'credits-section'
      });
    }

    // 6. Year (important metadata)
    if (!data.year.trim()) {
      errors.push({
        field: 'year',
        message: 'Year is required',
        priority: 6,
        scrollTarget: 'year-field'
      });
    }
    
    
    // 7. At least one video source required
    const hasVideoSource = 
      (data.videoProjectSrc && data.videoProjectSrc.trim()) ||
      (data.videoVimeoUrl && data.videoVimeoUrl.trim()) ||
      (data.videoYoutubeUrl && data.videoYoutubeUrl.trim()) ||
      (data.videoCloudflareUrl && data.videoCloudflareUrl.trim());

    if (!hasVideoSource) {
      errors.push({
        field: 'videoSources',
        message: 'At least one video source is required (Media Gallery, Vimeo, YouTube, or Cloudflare)',
        priority: 7,
        scrollTarget: 'Video Project'
      });
    }

    // 8. Project gallery (visual content)
    if (!data.images || data.images.length === 0) {
      errors.push({
        field: 'gallery',
        message: 'Project gallery must have at least one item',
        priority: 8,
        scrollTarget: 'gallery-section'
      });
    }
    
    
   
    
    // Field length validations (lower priority)
    if (data.title.trim().length > 255) {
      errors.push({
        field: 'title',
        message: 'Title must be less than 255 characters',
        priority: 9,
        scrollTarget: 'title-field'
      });
    }
    
    if (data.client.trim().length > 255) {
      errors.push({
        field: 'client',
        message: 'Client name must be less than 255 characters',
        priority: 10,
        scrollTarget: 'client-field'
      });
    }
    
    if (data.description.trim().length > 2000) {
      errors.push({
        field: 'description',
        message: 'Description must be less than 2000 characters',
        priority: 11,
        scrollTarget: 'description-field'
      });
    }
    
    // Validate year format
    if (data.year.trim() && !/^\d{4}$/.test(data.year.trim())) {
      errors.push({
        field: 'year',
        message: 'Year must be a 4-digit number',
        priority: 12,
        scrollTarget: 'year-field'
      });
    }
    
    return errors;
  };

    // Get validation status for UI feedback
  const getValidationStatus = () => {
    const errors = validateWorkData(workData);
    const isValid = errors.length === 0;
    
    // Sort errors by priority (lowest number = highest priority)
    const sortedErrors = errors.sort((a, b) => a.priority - b.priority);
    const highestPriorityError = sortedErrors[0];
    
    return {
      isValid: isValid,
      canPublish: isValid,
      canSaveDraft: isValid, // Same validation for both now
      errors: errors,
      highestPriorityError: highestPriorityError
    };
  };

  // Function to scroll to and highlight missing field
  const scrollToMissingField = () => {
    const validation = getValidationStatus();
    
    if (validation.isValid) {
      return; // No missing fields
    }
    
    const error = validation.highestPriorityError;
    
    // Show toast with the error message
    toast.error(error.message, {
      position: "top-center",
      autoClose: 4000,
    });
    
    // Scroll to the field
    const element = document.getElementById(error.scrollTarget);
    if (element) {
      // Remove existing highlights
      document.querySelectorAll('.validation-highlight').forEach(el => {
        el.classList.remove('validation-highlight');
      });
      
      // Add highlight class
      element.classList.add('validation-highlight');
      
      // Scroll to element
      element.scrollIntoView({ 
        behavior: 'smooth', 
        block: 'center',
        inline: 'center'
      });
      
      // Remove highlight after 3 seconds
      setTimeout(() => {
        element.classList.remove('validation-highlight');
      }, 3000);
    }
  };
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

  // Function to handle credits drag and drop reordering
  const handleCreditsDragEnd = (result) => {
    if (!result.destination) return;

    const items = Array.from(workData.credits);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);

    setWorkData((prevData) => ({
      ...prevData,
      credits: items,
    }));
  };

  // Function to handle name items drag and drop reordering within a credit
  const handleNamesDragEnd = (result, creditIndex) => {
    if (!result.destination) return;

    const updatedCredits = [...workData.credits];
    const names = Array.from(updatedCredits[creditIndex].name);
    const [reorderedName] = names.splice(result.source.index, 1);
    names.splice(result.destination.index, 0, reorderedName);

    updatedCredits[creditIndex].name = names;

    setWorkData((prevData) => ({
      ...prevData,
      credits: updatedCredits,
    }));
  };

  // Function to save and publish
  const savePublish = async () => {
    // Validate data for publishing
    const errors = validateWorkData(workData);
    if (errors.length > 0) {
      // Show only the highest priority error
      const highestPriorityError = errors.sort((a, b) => a.priority - b.priority)[0];
      toast.error(highestPriorityError.message, {
        position: "top-center",
        autoClose: 4000,
      });
      scrollToMissingField();
      return;
    }

    setIsSaving(true);
    
    try {
      const apiData = transformToAPIFormat(workData, 'published');
      
      // For now, we'll create a new work. Later we can add update logic
      const response = await worksAPI.createAndPublish(apiData);
      
      if (response.success) {
        toast.success("Work published successfully!", {
          position: "top-center",
          autoClose: 3000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
        });
        
        // Redirect to works list page after 2 seconds
        setTimeout(() => {
          navigate('/works');
        }, 2000);
        
        console.log("Work published:", response.data);
      } else {
        throw new Error(response.message || 'Failed to publish work');
      }
    } catch (error) {
      console.error('Error publishing work:', error);
      
      // Handle different types of errors
      let errorMessage = "Failed to publish work. Please try again.";
      
      if (error.name === 'ValidationError') {
        errorMessage = "Please check your form data and try again.";
      } else if (error.message?.includes('network') || error.message?.includes('fetch')) {
        errorMessage = "Network error. Please check your connection and try again.";
      } else if (error.message?.includes('unauthorized') || error.message?.includes('401')) {
        errorMessage = "Session expired. Please login again.";
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      toast.error(errorMessage, {
        position: "top-center",
        autoClose: 5000,
      });
    } finally {
      setIsSaving(false);
    }
  };

  const saveDraft = async () => {
    // Validate data for draft
    const errors = validateWorkData(workData);
    if (errors.length > 0) {
      // Show only the highest priority error
      const highestPriorityError = errors.sort((a, b) => a.priority - b.priority)[0];
      toast.error(highestPriorityError.message, {
        position: "top-center",
        autoClose: 4000,
      });
      scrollToMissingField();
      return;
    }

    setIsSaving(true);
    
    try {
      const apiData = transformToAPIFormat(workData, 'draft');
      
      // For now, we'll create a new work. Later we can add update logic
      const response = await worksAPI.createDraft(apiData);
      
      if (response.success) {
        toast.success("Work saved as draft!", {
          position: "top-center",
          autoClose: 3000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
        });
        
        // Redirect to works list page after 2 seconds
        setTimeout(() => {
          navigate('/works');
        }, 2000);
        
        console.log("Work saved as draft:", response.data);
      } else {
        throw new Error(response.message || 'Failed to save draft');
      }
    } catch (error) {
      console.error('Error saving draft:', error);
      
      // Handle different types of errors
      let errorMessage = "Failed to save draft. Please try again.";
      
      if (error.name === 'ValidationError') {
        errorMessage = "Please check your form data and try again.";
      } else if (error.message?.includes('network') || error.message?.includes('fetch')) {
        errorMessage = "Network error. Please check your connection and try again.";
      } else if (error.message?.includes('unauthorized') || error.message?.includes('401')) {
        errorMessage = "Session expired. Please login again.";
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      toast.error(errorMessage, {
        position: "top-center",
        autoClose: 5000,
      });
    } finally {
      setIsSaving(false);
    }
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
    handleCreditsDragEnd,
    handleNamesDragEnd,
    savePublish,
    saveDraft,
    handleDragEnd,
    getValidationStatus,
    scrollToMissingField,
  };
};